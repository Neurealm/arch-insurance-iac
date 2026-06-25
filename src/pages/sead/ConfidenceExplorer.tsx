import { SeadRail } from "@/components/sead/SeadRail";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Bell, Boxes, ChevronDown, Factory, HelpCircle, LayoutGrid, Network as NetIcon, Wrench, Sparkles, Gavel, Brain, ArrowLeft, Gauge, Lightbulb, GitBranch, Share2, Database, BookOpen, Puzzle, ShieldCheck, Sun, Box, AlertTriangle, Info, CheckCircle2, RefreshCw, Scale, Command, Search, Download, RotateCcw, Filter, Keyboard, ArrowUpDown, TrendingUp, TrendingDown, Zap, X, Plus, Target as TargetIcon, Users, UserCheck, FlaskConical, MessageSquare, Network,
} from "lucide-react";
import etchImg from "@/assets/etch-chamber-3d.jpg";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RTooltip, ReferenceLine,
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
/* ============================= header ============================= */
function AppHeader({ onPalette }: { onPalette: () => void }) {
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
      <button onClick={onPalette} className="h-9 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] flex items-center gap-2 text-slate-300 hover:text-white text-[11.5px]">
        <Search className="h-3.5 w-3.5" /> Command
        <kbd className="ml-1 px-1.5 py-[1px] rounded bg-white/[0.06] text-[10px] text-slate-400 border border-white/10">⌘K</kbd>
      </button>
      <div className="h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2">
        <Factory className="h-3.5 w-3.5 text-slate-400" />
        <div className="leading-tight">
          <div className="text-[9.5px] uppercase tracking-wider text-slate-500">Fab</div>
          <div className="text-[12.5px] font-semibold text-white">DFW Semiconductor Fab</div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
      </div>
      <div className="h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
        <div className="text-[12.5px] text-white font-semibold">May 23, 2025 10:24 AM CT</div>
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

/* ============================= donut ============================= */
function Donut({ value, size = 180, stroke = 14, color = "#22c55e", label, sub }: any) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none" />
        <motion.circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c}
          animate={{ strokeDashoffset: offset }} transition={{ duration: 0.6, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-[34px] font-bold text-white tabular-nums leading-none">{Math.round(value)}%</div>
          {sub && <div className="text-[11px] text-slate-400 mt-1">{sub}</div>}
          {label && <div className="text-[11px] text-emerald-300 mt-1">{label}</div>}
        </div>
      </div>
    </div>
  );
}

/* ============================= factor data ============================= */
type Factor = {
  id: string; icon: any; name: string; desc: string; baseline: number; weight: number;
  what: string; bullets: string[];
};

const FACTORS: Factor[] = [
  { id: "data",  icon: Database,    name: "Data Quality",            desc: "Quality and completeness of input data", baseline: 95, weight: 0.20,
    what: "High quality, complete, and recent data from multiple reliable sources.",
    bullets: ["All critical signals are present","Low noise and abnormalities","Recent calibration and validation","No data gaps in key time window"] },
  { id: "hist",  icon: BookOpen,    name: "Historical Similarity",   desc: "Similarity to past maintenance events",  baseline: 92, weight: 0.18,
    what: "6 of 6 nearest historical events match this signature with confirmed outcomes.",
    bullets: ["DTW match 0.82 against degradation library","6 closest neighbors converged on same window","Pattern stability over 22 days","No counter-examples in last 90 days"] },
  { id: "model", icon: Brain,       name: "Model Certainty",         desc: "AI model certainty in predicted outcomes",baseline: 86, weight: 0.18,
    what: "Ensemble of 8 models agrees on recommendation with low variance.",
    bullets: ["Ensemble agreement 86%","Posterior variance below threshold","No conflicting predictions","Calibration check passed"] },
  { id: "ctx",   icon: Puzzle,      name: "Context Completeness",    desc: "Coverage of operational context",        baseline: 84, weight: 0.14,
    what: "Production, dispatch, and facilities context all present and current.",
    bullets: ["MES queue depth captured","Dispatch rules validated","Facility windows confirmed","No missing dependencies"] },
  { id: "assum", icon: ShieldCheck, name: "Assumption Reliability",  desc: "Validity of assumptions used",           baseline: 75, weight: 0.10,
    what: "Key assumptions about alternates and utilities hold but should be monitored.",
    bullets: ["Alternate tool availability assumed","Utility stability assumed","Demand forecast within band","No black-swan events forecasted"] },
  { id: "ext",   icon: Sun,         name: "External Predictability", desc: "Predictability of external conditions",  baseline: 72, weight: 0.10,
    what: "External conditions stable but introduce moderate uncertainty.",
    bullets: ["Weather: stable next 5 days","Supply chain: no disruptions","Customer demand: holding","Regulatory: no changes"] },
  { id: "sim",   icon: Box,         name: "Simulation Confidence",   desc: "Confidence in what-if simulations",      baseline: 90, weight: 0.10,
    what: "Monte Carlo simulations converge across 10,000 runs.",
    bullets: ["10,000 Monte Carlo runs","Standard deviation low","All 4 scenarios fully evaluated","Sensitivity within bounds"] },
];

const INITIAL_SOURCES = [
  { src: "IoT Telemetry (Live)",       c: 98, t: 98, a: 96, w: 40, contrib: 38 },
  { src: "Process Data Historian",     c: 96, t: 94, a: 95, w: 20, contrib: 19 },
  { src: "Maintenance History",        c: 100,t: 90, a: 92, w: 15, contrib: 14 },
  { src: "Dispatch / RTD",             c: 95, t: 95, a: 93, w: 10, contrib: 9 },
  { src: "MES / Production",           c: 94, t: 92, a: 91, w: 10, contrib: 9 },
  { src: "Facilities / Utilities",     c: 92, t: 90, a: 90, w: 5,  contrib: 4 },
];

const BASE_TIME_SERIES = [
  { d: "May 16", v: 84 }, { d: "May 17", v: 85 }, { d: "May 18", v: 86 },
  { d: "May 19", v: 87 }, { d: "May 20", v: 86 }, { d: "May 21", v: 88 },
  { d: "May 22", v: 89 }, { d: "May 23", v: 89 },
];

const IMPROVEMENTS = [
  { id: "i1", title: "Install missing vibration sensor (X-axis)", gain: 2.5, affects: "data" },
  { id: "i2", title: "Calibrate RF generator sensors",            gain: 1.5, affects: "data" },
  { id: "i3", title: "Add additional similar tool to alternate list", gain: 2.5, affects: "assum" },
  { id: "i4", title: "Extend historical event library by 30 days", gain: 1.0, affects: "hist" },
];

/* ============================= bar ============================= */
function Bar({ value, color = "#22c55e", w = 80 }: any) {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden" style={{ width: w }}>
        <motion.div animate={{ width: `${value}%` }} transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ background: color }} className="h-full rounded-full" />
      </div>
    </div>
  );
}

/* ============================= page ============================= */
export default function ConfidenceExplorer() {
  const nav = useNavigate();
  const [tabId, setTabId] = useState<string>("data");
  const [factors, setFactors] = useState(FACTORS.map((f) => ({ ...f, value: f.baseline, enabled: true })));
  const [improvements, setImprovements] = useState<Record<string, boolean>>({});
  const [threshold, setThreshold] = useState(80);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawer, setDrawer] = useState<"help" | "method" | null>(null);
  const [sortKey, setSortKey] = useState<"src" | "contrib" | "w">("contrib");
  const [sortAsc, setSortAsc] = useState(false);

  /* live composite */
  const baseScore = useMemo(() => {
    const enabled = factors.filter((f) => f.enabled);
    const wSum = enabled.reduce((s, f) => s + f.weight, 0);
    if (wSum === 0) return 0;
    return enabled.reduce((s, f) => s + (f.value * f.weight), 0) / wSum;
  }, [factors]);

  const improvementGain = useMemo(
    () => IMPROVEMENTS.filter((i) => improvements[i.id]).reduce((s, i) => s + i.gain, 0),
    [improvements]
  );

  const liveScore = Math.min(100, baseScore + improvementGain);
  const delta = +(liveScore - 89).toFixed(1);
  const scoreColor = liveScore >= 90 ? "#22c55e" : liveScore >= 75 ? "#facc15" : liveScore >= 50 ? "#f59e0b" : "#f43f5e";
  const scoreLabel = liveScore >= 90 ? "High" : liveScore >= 75 ? "Strong" : liveScore >= 50 ? "Medium" : "Low";
  const meetsThreshold = liveScore >= threshold;

  const series = useMemo(() => {
    const arr = [...BASE_TIME_SERIES];
    arr[arr.length - 1] = { ...arr[arr.length - 1], v: Math.round(liveScore) };
    return arr;
  }, [liveScore]);

  const activeFactor = factors.find((f) => f.id === tabId)!;

  const sortedSources = useMemo(() => {
    const r = [...INITIAL_SOURCES];
    r.sort((a: any, b: any) => {
      let cmp = 0;
      if (sortKey === "src") cmp = a.src.localeCompare(b.src);
      else cmp = a[sortKey] - b[sortKey];
      return sortAsc ? cmp : -cmp;
    });
    return r;
  }, [sortKey, sortAsc]);

  const toggleSort = (k: any) => {
    if (sortKey === k) setSortAsc(!sortAsc); else { setSortKey(k); setSortAsc(false); }
  };

  const setFactorValue = (id: string, v: number) =>
    setFactors((prev) => prev.map((f) => f.id === id ? { ...f, value: v } : f));
  const toggleFactor = (id: string) =>
    setFactors((prev) => prev.map((f) => f.id === id ? { ...f, enabled: !f.enabled } : f));

  const resetAll = () => {
    setFactors(FACTORS.map((f) => ({ ...f, value: f.baseline, enabled: true })));
    setImprovements({});
    setThreshold(80);
    toast("Confidence model reset to baseline");
  };

  const exportCSV = () => {
    const rows = [
      ["Factor", "Weight", "Value", "Enabled"],
      ...factors.map((f) => [f.name, f.weight, f.value, f.enabled]),
      [],
      ["Source", "Completeness", "Timeliness", "Accuracy", "Weight", "Contribution"],
      ...INITIAL_SOURCES.map((s) => [s.src, s.c, s.t, s.a, s.w, s.contrib]),
      [],
      ["Composite", liveScore.toFixed(1)],
      ["Threshold", threshold],
      ["Meets threshold", meetsThreshold],
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "confidence-explorer.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported confidence model");
  };

  const recalc = () => {
    setFactors((prev) => prev.map((f) => ({ ...f, value: Math.max(0, Math.min(100, f.value + (Math.random() * 2 - 1))) })));
    toast.success(`Recalculated · composite ${liveScore.toFixed(1)}%`);
  };

  const toggleImprovement = (id: string) => {
    setImprovements((p) => ({ ...p, [id]: !p[id] }));
    const imp = IMPROVEMENTS.find((x) => x.id === id);
    if (imp) toast(improvements[id] ? `Removed: ${imp.title}` : `Applied: ${imp.title} (+${imp.gain}%)`);
  };

  /* hotkeys */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen(true); return; }
      if (e.key === "Escape") { setPaletteOpen(false); setDrawer(null); return; }
      if (e.key === "?") { e.preventDefault(); setDrawer("help"); return; }
      const k = e.key.toLowerCase();
      if (k === "r") { e.preventDefault(); recalc(); }
      else if (k === "e") { e.preventDefault(); exportCSV(); }
      else if (k === "0") { resetAll(); }
      else if (e.key >= "1" && e.key <= "7") {
        const idx = parseInt(e.key) - 1; if (factors[idx]) setTabId(factors[idx].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [factors, liveScore]);

  const commands = useMemo(() => [
    { icon: RefreshCw, label: "Recalculate confidence", kbd: "R", run: recalc },
    { icon: Download, label: "Export confidence CSV", kbd: "E", run: exportCSV },
    { icon: RotateCcw, label: "Reset to baseline", kbd: "0", run: resetAll },
    { icon: Info, label: "Methodology", run: () => setDrawer("method") },
    { icon: Keyboard, label: "Show keyboard shortcuts", kbd: "?", run: () => setDrawer("help") },
    ...factors.map((f, i) => ({ icon: f.icon, label: `Focus factor: ${f.name}`, hint: `${f.value.toFixed(0)}% · weight ${(f.weight*100).toFixed(0)}%`, kbd: String(i+1), run: () => setTabId(f.id) })),
    ...IMPROVEMENTS.map((i) => ({ icon: improvements[i.id] ? CheckCircle2 : Plus, label: `${improvements[i.id] ? "Remove" : "Apply"}: ${i.title}`, hint: `+${i.gain}%`, run: () => toggleImprovement(i.id) })),
  ], [factors, improvements, liveScore]);

  return (
    <div className="min-h-screen bg-[#070912] text-slate-200 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-32 h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-3xl" />

      <AppHeader onPalette={() => setPaletteOpen(true)} />
      <div className="flex">
        <SeadRail />
        <main className="flex-1 px-5 py-0">
          {/* ===== Sticky Action Bar ===== */}
          <div className="sticky top-0 z-30 -mx-5 px-5 py-3 backdrop-blur-xl bg-[#070912]/85 border-b border-white/[0.06]">
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => nav("/sead/ai-maintenance-decision-center")} className="flex items-center gap-1.5 text-sky-300 hover:text-sky-200 text-[11.5px] font-medium">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <div className="h-5 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-sky-300" />
                <div className="text-[11px] uppercase tracking-wider text-slate-500">Composite</div>
                <div className="text-[18px] font-bold tabular-nums" style={{ color: scoreColor }}>{liveScore.toFixed(1)}%</div>
                <span className={`text-[10.5px] font-semibold inline-flex items-center gap-1 ${delta > 0 ? "text-emerald-300" : delta < 0 ? "text-rose-300" : "text-slate-400"}`}>
                  {delta > 0 ? <TrendingUp className="h-3 w-3" /> : delta < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                  {delta > 0 ? "+" : ""}{delta}% vs published
                </span>
              </div>
              <div className="h-5 w-px bg-white/10" />
              <div className="flex items-center gap-2 min-w-[220px]">
                <span className="text-[11px] text-slate-400">Threshold</span>
                <input type="range" min={50} max={99} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))}
                  className="flex-1 accent-sky-400 h-1.5 cursor-pointer" />
                <span className="text-[11.5px] font-semibold text-white tabular-nums">{threshold}%</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${meetsThreshold ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/40" : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/40"}`}>
                  {meetsThreshold ? "PASS" : "BELOW"}
                </span>
              </div>
              <div className="flex-1" />
              <button onClick={recalc} className="h-8 px-2.5 rounded-md bg-sky-500/15 ring-1 ring-sky-400/40 text-sky-200 text-[11px] font-semibold inline-flex items-center gap-1.5 hover:bg-sky-500/25">
                <RefreshCw className="h-3.5 w-3.5" /> Recalculate <kbd className="ml-1 text-[9px] opacity-60">R</kbd>
              </button>
              <button onClick={exportCSV} className="h-8 px-2.5 rounded-md bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white text-[11px] font-semibold inline-flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" /> Export <kbd className="ml-1 text-[9px] opacity-60">E</kbd>
              </button>
              <button onClick={resetAll} className="h-8 px-2.5 rounded-md bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white text-[11px] font-semibold inline-flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> Reset <kbd className="ml-1 text-[9px] opacity-60">0</kbd>
              </button>
              <button onClick={() => setDrawer("help")} className="h-8 w-8 rounded-md bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white grid place-items-center">
                <Keyboard className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="py-5 space-y-5">
          {/* HERO */}
          <GlassCard className="p-5">
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
              <div className="col-span-3 flex items-center gap-3">
                <Donut value={liveScore} size={120} stroke={11} color={scoreColor} sub={scoreLabel} />
                <div>
                  <div className="text-[10.5px] uppercase tracking-wider text-slate-500">Composite</div>
                  <div className="text-[12px] text-white font-semibold mt-1">{scoreLabel} confidence recommendation</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Baseline {baseScore.toFixed(1)}% {improvementGain > 0 && (<span className="text-emerald-300">+ {improvementGain.toFixed(1)}% improvements</span>)}
                  </div>
                </div>
              </div>
              <div className="col-span-3">
                <div className="text-[12px] text-white font-semibold">What is Confidence?</div>
                <div className="text-[11px] text-slate-400 mt-1">NeuGAIN Confidence reflects the reliability of the recommendation based on data quality, model certainty, assumptions, and risk.</div>
                <button onClick={() => setDrawer("method")} className="mt-1.5 text-[11px] text-sky-300 hover:text-sky-200 inline-flex items-center gap-1">Methodology →</button>
              </div>
            </div>
          </GlassCard>

          {/* MAIN 3-COL */}
          <div className="grid grid-cols-12 gap-5">

            {/* LEFT: breakdown — now interactive sliders */}
            <div className="col-span-3 space-y-5">
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[13.5px] font-semibold text-white">Confidence Breakdown</div>
                  <span className="text-[10.5px] text-slate-500">click to focus</span>
                </div>
                <div className="text-[11px] text-slate-500 mb-3">Drag sliders to model sensitivity</div>
                <div className="space-y-2.5">
                  {factors.map((f, i) => {
                    const color = f.value >= 90 ? "#22c55e" : f.value >= 75 ? "#84cc16" : f.value >= 50 ? "#f59e0b" : "#f43f5e";
                    const isSel = tabId === f.id;
                    return (
                      <div key={f.id} className={`rounded-lg p-2 transition cursor-pointer ${isSel ? "bg-sky-500/8 ring-1 ring-sky-400/30" : "hover:bg-white/[0.025]"}`}
                        onClick={() => setTabId(f.id)}>
                        <div className="flex items-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); toggleFactor(f.id); }}
                            className={`h-4 w-4 rounded grid place-items-center ring-1 ${f.enabled ? "bg-sky-500/30 ring-sky-400/50 text-sky-200" : "bg-white/[0.04] ring-white/10 text-slate-500"}`}>
                            {f.enabled ? <CheckCircle2 className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          </button>
                          <div className="h-7 w-7 rounded-md bg-white/[0.04] ring-1 ring-white/10 grid place-items-center text-slate-300">
                            <f.icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11.5px] text-white font-medium truncate flex items-center gap-1.5">
                              {f.name}
                              <kbd className="text-[9px] text-slate-500 px-1 bg-white/5 rounded">{i+1}</kbd>
                            </div>
                            <div className="text-[10px] text-slate-500">w {(f.weight*100).toFixed(0)}%</div>
                          </div>
                          <div className="text-[12px] font-bold tabular-nums w-10 text-right" style={{ color }}>{f.value.toFixed(0)}%</div>
                        </div>
                        <input type="range" min={0} max={100} value={f.value} disabled={!f.enabled}
                          onChange={(e) => setFactorValue(f.id, Number(e.target.value))}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full mt-1.5 accent-sky-400 h-1 cursor-pointer disabled:opacity-30" />
                      </div>
                    );
                  })}
                </div>
                <div className="relative h-1.5 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 mt-4" />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Low</span><span>Medium</span><span>High</span>
                </div>
              </GlassCard>

              <GlassCard className="p-5">
                <div className="text-[13.5px] font-semibold text-white mb-3">Confidence Level Guide</div>
                <div className="space-y-2 text-[11px]">
                  {[
                    { rng: "0 – 50%",  lbl: "Low",    color: "text-rose-400",    sub: "High uncertainty, limited data", act: "Use with caution" },
                    { rng: "50 – 75%", lbl: "Medium", color: "text-amber-300",   sub: "Moderate confidence",            act: "Review assumptions" },
                    { rng: "75 – 90%", lbl: "Strong", color: "text-lime-300",    sub: "Reliable recommendation",        act: "Proceed with monitoring" },
                    { rng: "90 – 100%",lbl: "High",   color: "text-emerald-300", sub: "Very reliable",                  act: "Proceed with confidence" },
                  ].map((b) => {
                    const lo = parseInt(b.rng);
                    const hi = parseInt(b.rng.split("–")[1]);
                    const inBand = liveScore >= lo && liveScore < (hi === 100 ? 101 : hi);
                    return (
                      <div key={b.rng} className={`p-2 rounded-md ring-1 ${inBand ? "bg-sky-500/8 ring-sky-400/40" : "bg-white/[0.02] ring-white/5"}`}>
                        <div className="flex items-center justify-between">
                          <div className="text-slate-500">{b.rng}</div>
                          <div className={`font-semibold ${b.color}`}>{b.lbl}{inBand && " ← current"}</div>
                        </div>
                        <div className="text-slate-300 mt-0.5">{b.sub}</div>
                        <div className="text-slate-500">{b.act}</div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>

            {/* CENTER: dive */}
            <div className="col-span-6 space-y-5">
              <GlassCard className="p-5">
                <div className="text-[13.5px] font-semibold text-white">Dive into Each Factor</div>
                <div className="flex items-center gap-4 mt-3 border-b border-white/[0.06] overflow-x-auto">
                  {factors.map((f, i) => (
                    <button key={f.id} onClick={() => setTabId(f.id)}
                      className={`pb-2 text-[12px] transition relative whitespace-nowrap inline-flex items-center gap-1.5 ${tabId === f.id ? "text-sky-300" : "text-slate-400 hover:text-slate-200"}`}>
                      <f.icon className="h-3.5 w-3.5" /> {f.name}
                      <span className="text-[10px] text-slate-500 tabular-nums">{f.value.toFixed(0)}%</span>
                      {tabId === f.id && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-sky-400 rounded-full" />}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-12 gap-4 mt-4">
                  <div className="col-span-3 text-center">
                    <div className="text-[11px] text-slate-400 mb-2">Factor Score</div>
                    <Donut value={activeFactor.value} size={150} stroke={12}
                      color={activeFactor.value >= 90 ? "#22c55e" : activeFactor.value >= 75 ? "#84cc16" : activeFactor.value >= 50 ? "#f59e0b" : "#f43f5e"}
                      label={activeFactor.value >= 90 ? "Excellent" : activeFactor.value >= 75 ? "Strong" : activeFactor.value >= 50 ? "Moderate" : "Weak"} />
                    <div className="text-[10.5px] text-slate-500 mt-2">Weight {(activeFactor.weight*100).toFixed(0)}% · Contribution {(activeFactor.value * activeFactor.weight).toFixed(1)} pts</div>
                  </div>
                  <div className="col-span-4">
                    <div className="text-[11px] text-slate-400 mb-2">What This Means</div>
                    <div className="text-[12px] text-slate-200 leading-relaxed">{activeFactor.what}</div>
                    <ul className="mt-3 space-y-1.5 text-[11.5px] text-slate-300">
                      {activeFactor.bullets.map((x) => (
                        <li key={x} className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" /> {x}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="col-span-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[11px] text-slate-400">Score Over Time</div>
                      <div className="text-[10.5px] text-slate-500">Threshold {threshold}%</div>
                    </div>
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={series} margin={{ top: 6, right: 8, left: -10, bottom: 0 }}>
                          <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="d" stroke="#64748b" fontSize={10} />
                          <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} ticks={[0,25,50,75,100]} tickFormatter={(v)=>`${v}%`} />
                          <RTooltip contentStyle={{ background: "#0b1020", border: "1px solid rgba(255,255,255,0.08)", fontSize: 11 }} />
                          <ReferenceLine y={threshold} stroke="#38bdf8" strokeDasharray="3 3" label={{ value: "Threshold", fill: "#7dd3fc", fontSize: 9, position: "insideTopRight" }} />
                          <Line type="monotone" dataKey="v" stroke={scoreColor} strokeWidth={2} dot={{ r: 3, fill: scoreColor }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* sources table */}
                <div className="mt-5">
                  <div className="text-[12.5px] font-semibold text-white mb-2">Data Source Contribution</div>
                  <div className="grid grid-cols-12 text-[10.5px] uppercase tracking-wider text-slate-500 pb-2 border-b border-white/[0.06]">
                    <button onClick={() => toggleSort("src")} className="col-span-3 inline-flex items-center gap-1 hover:text-white text-left">Source <ArrowUpDown className="h-2.5 w-2.5" /></button>
                    <div className="col-span-2">Completeness</div>
                    <div className="col-span-2">Timeliness</div>
                    <div className="col-span-2">Accuracy</div>
                    <button onClick={() => toggleSort("w")} className="col-span-1 inline-flex items-center gap-1 hover:text-white">Wt <ArrowUpDown className="h-2.5 w-2.5" /></button>
                    <button onClick={() => toggleSort("contrib")} className="col-span-2 inline-flex items-center gap-1 hover:text-white justify-end w-full">Contribution <ArrowUpDown className="h-2.5 w-2.5" /></button>
                  </div>
                  {sortedSources.map((s) => (
                    <div key={s.src} className="grid grid-cols-12 items-center text-[11.5px] py-2 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
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
                  <Donut value={liveScore} size={140} stroke={12} color={scoreColor} sub={`${scoreLabel} Confidence`} />
                  <div className="space-y-1.5 text-[11.5px]">
                    <div className="text-slate-400">Why this level?</div>
                    <div className="text-slate-300 leading-snug">Strong data quality and model agreement, with moderate assumptions and minimal unknowns.</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5 text-[11.5px]">
                  {(() => {
                    const strong = factors.filter((f) => f.enabled && f.value >= 90).length;
                    const moderate = factors.filter((f) => f.enabled && f.value >= 75 && f.value < 90).length;
                    const weak = factors.filter((f) => f.enabled && f.value < 75).length;
                    const off = factors.filter((f) => !f.enabled).length;
                    return [
                      { c: "bg-emerald-400", t: `Strong Factors (${strong})` },
                      { c: "bg-amber-400",   t: `Moderate Factors (${moderate})` },
                      { c: "bg-orange-400",  t: `Weak Factors (${weak})` },
                      { c: "bg-slate-500",   t: `Disabled (${off})` },
                    ].map(x => (
                      <div key={x.t} className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${x.c}`} /><span className="text-slate-300">{x.t}</span></div>
                    ));
                  })()}
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
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[13.5px] font-semibold text-white">Improve Confidence</div>
                  {improvementGain > 0 && <span className="text-[10.5px] text-emerald-300 font-semibold tabular-nums">+{improvementGain.toFixed(1)}% applied</span>}
                </div>
                {IMPROVEMENTS.map((i) => {
                  const active = !!improvements[i.id];
                  return (
                    <button key={i.id} onClick={() => toggleImprovement(i.id)}
                      className={`w-full flex items-start gap-2 py-2 border-b border-white/[0.04] last:border-0 text-left transition ${active ? "bg-emerald-500/5" : "hover:bg-white/[0.02]"}`}>
                      <div className={`h-4 w-4 rounded grid place-items-center mt-0.5 shrink-0 ring-1 ${active ? "bg-emerald-500/30 ring-emerald-400/50 text-emerald-200" : "bg-white/[0.04] ring-white/10 text-slate-500"}`}>
                        {active ? <CheckCircle2 className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11.5px] text-white leading-snug">{i.title}</div>
                        <div className="text-[10.5px] text-emerald-300">Potential gain: +{i.gain}%</div>
                      </div>
                    </button>
                  );
                })}
                <button onClick={recalc} className="mt-3 w-full h-9 rounded-lg bg-sky-500/10 border border-sky-400/30 text-sky-200 text-[12px] font-semibold inline-flex items-center justify-center gap-2 hover:bg-sky-500/15">
                  <RefreshCw className="h-3.5 w-3.5" /> Recalculate Confidence
                </button>
                <div className="text-[10.5px] text-slate-500 mt-2 text-center">Composite now {liveScore.toFixed(1)}% · target {threshold}%</div>
              </GlassCard>
            </div>
          </div>
          </div>
        </main>
      </div>

      <Drawer kind={drawer} onClose={() => setDrawer(null)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands} />
    </div>
  );
}

/* ============================= drawer ============================= */
function Drawer({ kind, onClose }: { kind: "help" | "method" | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {kind && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <motion.aside initial={{ x: 460 }} animate={{ x: 0 }} exit={{ x: 460 }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed right-0 top-0 bottom-0 w-[440px] z-50 bg-[#0b0f1a] border-l border-white/10 flex flex-col">
            <div className="px-5 py-4 border-b border-white/10 flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-sky-300 font-semibold">{kind === "help" ? "Help" : "Methodology"}</div>
                <div className="text-[15px] font-semibold text-white mt-0.5">{kind === "help" ? "Keyboard Shortcuts" : "How Confidence is Computed"}</div>
              </div>
              <button onClick={onClose} className="h-8 w-8 rounded-md bg-white/[0.04] hover:bg-white/[0.08] grid place-items-center text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 text-[12.5px] text-slate-300 leading-relaxed">
              {kind === "help" ? (
                <div className="space-y-1.5">
                  {[
                    ["⌘K / Ctrl+K", "Open command palette"],
                    ["1 – 7", "Focus factor 1–7"],
                    ["R", "Recalculate confidence"],
                    ["E", "Export CSV"],
                    ["0", "Reset to baseline"],
                    ["?", "Show this help"],
                    ["ESC", "Close drawer / palette"],
                  ].map(([k, d]) => (
                    <div key={k} className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
                      <kbd className="px-2 py-0.5 rounded bg-white/[0.06] text-[11px] text-white border border-white/10">{k}</kbd>
                      <span className="text-slate-400">{d}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <p><span className="text-white font-semibold">Composite formula.</span> Confidence = Σ(factorᵢ × weightᵢ) / Σ(weightᵢ) across enabled factors, plus any applied improvement deltas.</p>
                  <p><span className="text-white font-semibold">Factors.</span> Data Quality, Historical Similarity, Model Certainty, Context Completeness, Assumption Reliability, External Predictability, Simulation Confidence.</p>
                  <p><span className="text-white font-semibold">Bands.</span> Low &lt; 50, Medium 50–75, Strong 75–90, High ≥ 90. The threshold slider sets the pass/fail line used in governance.</p>
                  <p><span className="text-white font-semibold">Improvements.</span> Toggling an improvement adds its modeled gain to the composite without altering the baseline factor scores.</p>
                  <p><span className="text-white font-semibold">Sources.</span> Source-level scores combine into Data Quality via Completeness × Timeliness × Accuracy weighted by source weight.</p>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ============================= command palette ============================= */
function CommandPalette({ open, onClose, commands }: any) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) { setQ(""); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);
  const filtered = useMemo(() => {
    const t = q.toLowerCase();
    return commands.filter((c: any) => !t || c.label.toLowerCase().includes(t) || (c.hint || "").toLowerCase().includes(t));
  }, [q, commands]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] grid place-items-start pt-[14vh] px-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
            className="relative w-full max-w-xl rounded-xl border border-white/10 bg-[#0b0f1a] shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-3 h-11 border-b border-white/10">
              <Command className="h-4 w-4 text-sky-300" />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-[13px] text-white placeholder:text-slate-500 outline-none" />
              <kbd className="text-[10px] text-slate-400 border border-white/10 px-1.5 py-[1px] rounded bg-white/[0.04]">ESC</kbd>
            </div>
            <div className="max-h-[360px] overflow-y-auto py-1">
              {filtered.map((c: any, i: number) => (
                <button key={i} onClick={() => { c.run(); onClose(); }}
                  className="w-full px-3 py-2 flex items-center gap-3 hover:bg-white/[0.05] text-left">
                  <c.icon className="h-4 w-4 text-sky-300 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] text-white truncate">{c.label}</div>
                    {c.hint && <div className="text-[10.5px] text-slate-500 truncate">{c.hint}</div>}
                  </div>
                  {c.kbd && <kbd className="text-[10px] text-slate-400 border border-white/10 px-1.5 py-[1px] rounded bg-white/[0.04]">{c.kbd}</kbd>}
                </button>
              ))}
              {filtered.length === 0 && <div className="px-3 py-6 text-center text-[12px] text-slate-500">No results</div>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
