import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Bell, Boxes, ChevronDown, ChevronRight, Factory, HelpCircle, LayoutGrid, Network as NetIcon,
  Wrench, Sparkles, Gavel, Brain, ArrowLeft, Play, Pause, SkipBack, SkipForward, Activity,
  TrendingUp, BookOpen, ClipboardList, Users, BarChart3, Trophy, CheckCircle2, Wand2,
  Gauge, Lightbulb, GitBranch, Share2, ShieldCheck, AlertTriangle, Database, Cpu, Settings,
  ScrollText, Clock, Scale, Command, Search, Download, RotateCcw, Filter, Star, Keyboard,
  Repeat, X, Zap, Target as TargetIcon } from "lucide-react";
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
  { icon: Scale, label: "Simulation\nComparison", to: "/sead/simulation-comparison" },
  { icon: Factory, label: "Factory\nImpact", to: "/sead/factory-impact-simulator" },
  { icon: Sparkles, label: "Decision\nCenter", to: "/sead/ai-maintenance-decision-center" },
  { icon: Gavel, label: "Human\nGovernance", to: "/sead/human-governance-center" },
  { icon: Brain, label: "AI Reasoning", to: "/sead/ai-reasoning-playback", active: true },
  { icon: Gauge, label: "Confidence\nExplorer", to: "/sead/confidence-explorer" },
  { icon: Lightbulb, label: "Explainability", to: "/sead/explainability" },
  { icon: GitBranch, label: "What If", to: "/sead/what-if" },
  { icon: Share2, label: "Knowledge\nGraph", to: "/sead/knowledge-graph" },
  { icon: BookOpen, label: "Operational\nLearning", to: "/sead/operational-learning" },
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
            <motion.span layoutId="rail-arp-indicator"
              className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-r bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
          )}
        </button>
      ))}
    </aside>
  );
}

/* ============================= header ============================= */
function AppHeader({ onPalette }: { onPalette: () => void }) {
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

type Step = {
  n: number; time: string; off: string; title: string; sub: string;
  evidence: string; impact: Impact; confidence: number; icon: any;
  detail: string; category: string;
};

const STEPS: Step[] = [
  { n: 1, time: "09:42:13", off: "+00:00", title: "Detected Early Degradation Signal", sub: "Pump vibration increased above normal operating band.",
    evidence: "Vibration RMS 2.8 mm/s (↑28% vs baseline)", impact: "Low", confidence: 96, icon: Activity, category: "Telemetry",
    detail: "Cryo-pump bearing vibration trended above the rolling 30-day p95 envelope for 47 minutes. Telemetry pulled from SECS/GEM stream s2f49." },
  { n: 2, time: "09:42:14", off: "+00:01", title: "Correlated With Process Instability", sub: "RF power stability and chamber pressure showed correlated drift.",
    evidence: "Pressure variation ↑16%, RF stability ↓2.1%", impact: "Low", confidence: 92, icon: TrendingUp, category: "Correlation",
    detail: "Pearson r = 0.84 between vibration spectra and RF reflected power over the last 4 process lots." },
  { n: 3, time: "09:42:15", off: "+00:02", title: "Matched Historical Degradation Patterns", sub: "Matched 6 similar historical events with confirmed failures.",
    evidence: "Pattern match score 0.82 (6/6 features aligned)", impact: "Medium", confidence: 85, icon: BookOpen, category: "Pattern Match",
    detail: "DTW distance against the cryo-pump degradation library returned 6 nearest neighbors; all preceded scheduled service within 14–22 days." },
  { n: 4, time: "09:42:18", off: "+00:05", title: "Checked Production Context", sub: "Evaluated lots in queue, due dates, and tool criticality.",
    evidence: "12 lots in queue, 2 customer shipments at risk if delayed", impact: "Medium", confidence: 88, icon: ClipboardList, category: "Production",
    detail: "MES queue depth 12; 2 lots tied to Tier-1 automotive commitments with Friday cutoffs." },
  { n: 5, time: "09:42:19", off: "+00:06", title: "Evaluated Alternate Tools", sub: "Checked availability and capacity of qualified alternate tools.",
    evidence: "2 alternate tools available, capacity constraint on Tool ETCH-221", impact: "Low", confidence: 86, icon: Boxes, category: "Capacity",
    detail: "ETCH-219 and ETCH-223 qualified for recipe MEX-7A; ETCH-221 already at 94% utilization." },
  { n: 6, time: "09:42:22", off: "+00:09", title: "Reviewed Dispatch & Resource Constraints", sub: "Validated technician availability, PM window rules, and work center load.",
    evidence: "1 qualified tech available Thu night, dispatch rules allow window", impact: "Low", confidence: 90, icon: Users, category: "Resources",
    detail: "Tech roster checked against skill matrix; dispatch rule DR-118 permits 4h PM window between 22:00–02:00." },
  { n: 7, time: "09:42:23", off: "+00:10", title: "Analyzed Utilities & Facilities", sub: "Checked utility availability and facility constraints.",
    evidence: "DI water stable, N2 utilization 62%, no planned outages", impact: "Low", confidence: 95, icon: Gauge, category: "Facilities",
    detail: "Facilities BMS confirmed no scheduled chilled-water work; N2 header pressure within spec." },
  { n: 8, time: "09:42:24", off: "+00:11", title: "Simulated Maintenance Windows", sub: "Ran what-if simulations across 4 candidate windows.",
    evidence: "Simulated 4 windows, evaluated across 9 impact dimensions", impact: "High", confidence: 87, icon: BarChart3, category: "Simulation",
    detail: "Monte Carlo n=10,000 across Now / Tonight / Tomorrow / Next Week; objective = minimize weighted business impact." },
  { n: 9, time: "09:42:25", off: "+00:12", title: "Scored & Selected Optimal Window", sub: "Scored outcomes and selected the window with the best overall result.",
    evidence: "Window May 28, 10:00 PM – May 29, 2:00 AM scored 91/100", impact: "Low", confidence: 89, icon: Trophy, category: "Scoring",
    detail: "Tonight window scored 91/100 vs. 78 (Now), 84 (Tomorrow), 71 (Next Week)." },
  { n: 10, time: "09:42:26", off: "+00:13", title: "Generated Recommendation", sub: "Final recommendation created with rationale and guardrails.",
    evidence: "All guardrails satisfied, confidence above threshold", impact: "Low", confidence: 89, icon: CheckCircle2, category: "Output",
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

const SCENARIOS = [
  { id: "now",     label: "Act Now",       score: 78, delta: -13, impact: "High",   color: "text-rose-300" },
  { id: "tonight", label: "Tonight ★",     score: 91, delta:  0,  impact: "Low",    color: "text-emerald-300" },
  { id: "tmrw",    label: "Tomorrow",      score: 84, delta:  -7, impact: "Medium", color: "text-amber-300" },
  { id: "next",    label: "Next Week",     score: 71, delta: -20, impact: "High",   color: "text-rose-300" },
];

/* ============================= page ============================= */
export default function AIReasoningPlayback() {
  const nav = useNavigate();
  const [active, setActive] = useState(9);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const [showDetails, setShowDetails] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set([3, 8, 9]));
  const [query, setQuery] = useState("");
  const [impactFilter, setImpactFilter] = useState<Impact | "all">("all");
  const [loop, setLoop] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawer, setDrawer] = useState<Step | "help" | null>(null);
  const [scenario, setScenario] = useState<string>("tonight");
  const timerRef = useRef<number | null>(null);

  /* ===== playback engine ===== */
  useEffect(() => {
    if (!playing) return;
    timerRef.current = window.setInterval(() => {
      setActive((s) => {
        if (s >= STEPS.length) {
          if (loop) return 1;
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1200 / speed);
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [playing, speed, loop]);

  const progressPct = (active / STEPS.length) * 100;
  const elapsed = useMemo(() => {
    const s = Math.min(active, STEPS.length) - 1;
    return s < 0 ? "00:00" : STEPS[s].off.replace("+", "");
  }, [active]);

  /* ===== filtering ===== */
  const filteredSteps = useMemo(() => {
    const q = query.trim().toLowerCase();
    return STEPS.filter((s) => {
      if (impactFilter !== "all" && s.impact !== impactFilter) return false;
      if (!q) return true;
      return [s.title, s.sub, s.evidence, s.category, s.detail].some((t) => t.toLowerCase().includes(q));
    });
  }, [query, impactFilter]);

  /* ===== actions ===== */
  const togglePlay = () => { if (active >= STEPS.length) setActive(1); setPlaying((p) => !p); };
  const toggleBookmark = (n: number) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n); else next.add(n);
      toast(next.has(n) ? `Bookmarked step ${n}` : `Removed bookmark ${n}`);
      return next;
    });
  };
  const exportCSV = () => {
    const rows = [
      ["Step", "Time", "Offset", "Title", "Category", "Evidence", "Impact", "Confidence"],
      ...STEPS.map((s) => [s.n, s.time, s.off, s.title, s.category, s.evidence, s.impact, s.confidence]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "ai-reasoning-trace.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Reasoning trace exported");
  };
  const resetAll = () => {
    setActive(1); setPlaying(false); setExpanded({}); setQuery(""); setImpactFilter("all");
    toast("Playback reset");
  };

  /* ===== hotkeys ===== */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT")) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen(true); return; }
      if (e.key === "Escape") { setPaletteOpen(false); setDrawer(null); return; }
      if (e.key === "?" ) { e.preventDefault(); setDrawer("help"); return; }
      if (e.key === " ") { e.preventDefault(); togglePlay(); return; }
      if (e.key === "ArrowRight") { e.preventDefault(); setActive((s) => Math.min(s + 1, STEPS.length)); return; }
      if (e.key === "ArrowLeft")  { e.preventDefault(); setActive((s) => Math.max(s - 1, 1)); return; }
      if (e.key === "Home") { setActive(1); return; }
      if (e.key === "End")  { setActive(STEPS.length); return; }
      const k = e.key.toLowerCase();
      if (k === "d") { setShowDetails((v) => !v); }
      else if (k === "l") { setLoop((v) => { toast(v ? "Loop off" : "Loop on"); return !v; }); }
      else if (k === "e") { exportCSV(); }
      else if (k === "r") { resetAll(); }
      else if (k === "b") { toggleBookmark(active); }
      else if (k === "+" || k === "=") { setSpeed((s) => (s === 1 ? 2 : s === 2 ? 4 : 4)); }
      else if (k === "-" || k === "_") { setSpeed((s) => (s === 4 ? 2 : s === 2 ? 1 : 1)); }
      else if (e.key >= "0" && e.key <= "9") {
        const n = e.key === "0" ? 10 : parseInt(e.key);
        if (STEPS[n - 1]) setActive(n);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const currentStep = STEPS[Math.min(active, STEPS.length) - 1];
  const tickerEvents = useMemo(() => STEPS.map((s) => `${s.off} · ${s.title}`), []);

  const commands = useMemo(() => [
    { icon: playing ? Pause : Play, label: playing ? "Pause playback" : "Play playback", kbd: "Space", run: togglePlay },
    { icon: SkipForward, label: "Next step", kbd: "→", run: () => setActive((s) => Math.min(s + 1, STEPS.length)) },
    { icon: SkipBack,    label: "Previous step", kbd: "←", run: () => setActive((s) => Math.max(s - 1, 1)) },
    { icon: SkipBack,    label: "Jump to first step", kbd: "Home", run: () => setActive(1) },
    { icon: SkipForward, label: "Jump to last step", kbd: "End", run: () => setActive(STEPS.length) },
    { icon: Repeat, label: loop ? "Disable loop" : "Enable loop", kbd: "L", run: () => setLoop((v) => !v) },
    { icon: Zap, label: "Cycle speed (1× → 2× → 4×)", kbd: "+", run: () => setSpeed((s) => (s === 1 ? 2 : s === 2 ? 4 : 1)) },
    { icon: Filter, label: "Show step details", kbd: "D", run: () => setShowDetails((v) => !v) },
    { icon: Star, label: `Bookmark step ${active}`, kbd: "B", run: () => toggleBookmark(active) },
    { icon: Download, label: "Export reasoning CSV", kbd: "E", run: exportCSV },
    { icon: RotateCcw, label: "Reset playback", kbd: "R", run: resetAll },
    { icon: Keyboard, label: "Show keyboard shortcuts", kbd: "?", run: () => setDrawer("help") },
    ...STEPS.map((s) => ({
      icon: s.icon, label: `Jump to step ${s.n}: ${s.title}`, hint: `${s.category} · ${s.confidence}%`, kbd: String(s.n % 10),
      run: () => setActive(s.n),
    })),
  ], [playing, loop, active]);

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-200" style={{
      backgroundImage:
        "radial-gradient(1000px 600px at 12% -10%, rgba(56,189,248,0.07), transparent), " +
        "radial-gradient(900px 500px at 110% 10%, rgba(139,92,246,0.06), transparent)",
    }}>
      <AppHeader onPalette={() => setPaletteOpen(true)} />
      <div className="flex">
        <ModuleRail />
        <main className="flex-1 px-6 py-0">
          {/* ===== Sticky Action Bar / Scrubber ===== */}
          <div className="sticky top-0 z-30 -mx-6 px-6 py-3 backdrop-blur-xl bg-[#070a13]/85 border-b border-white/[0.06]">
            <div className="flex items-center gap-3 flex-wrap">
              <button onClick={() => nav("/sead/ai-maintenance-decision-center")}
                className="flex items-center gap-1.5 text-sky-300 hover:text-sky-200 text-[11.5px] font-medium">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <div className="h-5 w-px bg-white/10" />
              <button onClick={togglePlay}
                className="h-8 px-3 rounded-md bg-sky-500 hover:bg-sky-400 text-white text-[11.5px] font-semibold flex items-center gap-1.5 shadow-[0_0_20px_-6px_rgba(56,189,248,0.7)]">
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {playing ? "Pause" : "Play"}
                <kbd className="ml-1 text-[9px] opacity-70">␣</kbd>
              </button>
              <CtlBtn icon={SkipBack} onClick={() => setActive((s) => Math.max(s - 1, 1))} />
              <CtlBtn icon={SkipForward} onClick={() => setActive((s) => Math.min(s + 1, STEPS.length))} />
              <SpeedMenu value={speed} onChange={setSpeed} />
              <button onClick={() => setLoop((v) => !v)}
                className={`h-8 px-2.5 rounded-md text-[11px] font-semibold inline-flex items-center gap-1.5 border ${
                  loop ? "bg-indigo-500/20 border-indigo-400/40 text-indigo-200" : "bg-white/[0.04] border-white/10 text-slate-300 hover:text-white"
                }`}><Repeat className="h-3.5 w-3.5" /> Loop</button>
              <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer select-none">
                <input type="checkbox" checked={showDetails} onChange={(e) => setShowDetails(e.target.checked)} className="h-3.5 w-3.5 accent-sky-400" /> Details
              </label>
              <div className="flex-1 flex items-center gap-2 min-w-[240px]">
                {/* Scrubber */}
                <input type="range" min={1} max={STEPS.length} value={active}
                  onChange={(e) => setActive(Number(e.target.value))}
                  className="flex-1 h-1.5 accent-sky-400 cursor-pointer" />
                <div className="text-[10.5px] font-mono text-slate-400 tabular-nums">
                  Step {active}/{STEPS.length} · {elapsed} / 00:13
                </div>
              </div>
              <button onClick={exportCSV} className="h-8 px-2.5 rounded-md bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white text-[11px] font-semibold inline-flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5" /> Export <kbd className="ml-1 text-[9px] opacity-60">E</kbd>
              </button>
              <button onClick={resetAll} className="h-8 px-2.5 rounded-md bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white text-[11px] font-semibold inline-flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> Reset <kbd className="ml-1 text-[9px] opacity-60">R</kbd>
              </button>
              <button onClick={() => setDrawer("help")} className="h-8 w-8 rounded-md bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white grid place-items-center">
                <Keyboard className="h-3.5 w-3.5" />
              </button>
            </div>
            {/* Progress bar with bookmark markers */}
            <div className="relative h-1.5 mt-2.5 rounded-full bg-white/[0.05] overflow-visible">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500"
                animate={{ width: `${progressPct}%` }} transition={{ duration: 0.3 }} />
              {[...bookmarks].map((n) => (
                <span key={n} className="absolute -top-[2px] h-2.5 w-[3px] rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]"
                  style={{ left: `calc(${(n / STEPS.length) * 100}% - 1.5px)` }} title={`Bookmark step ${n}`} />
              ))}
            </div>
          </div>

          <div className="py-5 space-y-4">
            {/* Live ticker */}
            <EventTicker events={tickerEvents} />

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
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Current Step</div>
                  <div className="text-[14px] font-semibold text-white">{currentStep.n}. {currentStep.title}</div>
                  <div className={`text-[11px] font-semibold ${impactTone(currentStep.impact)}`}>{currentStep.impact} impact · {currentStep.confidence}%</div>
                </div>
                <div className="flex-1" />
                {/* Confidence sparkline across all steps */}
                <ConfidenceTrend active={active} onPick={setActive} />
              </div>
            </GlassCard>

            {/* Main grid */}
            <div className="grid grid-cols-12 gap-4">
              {/* Timeline */}
              <GlassCard className="col-span-12 xl:col-span-8 p-4">
                <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                  <div>
                    <div className="text-[14px] font-semibold text-white">Reasoning Timeline (Playback)</div>
                    <div className="text-[11px] text-slate-400">Replay how NeuGAIN analyzed inputs, evaluated scenarios, and generated the recommendation</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2 h-7 rounded-md bg-white/[0.03] ring-1 ring-white/10">
                      <Search className="h-3 w-3 text-slate-500" />
                      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search steps..."
                        className="bg-transparent text-[11px] text-white placeholder:text-slate-500 outline-none w-40" />
                    </div>
                    <div className="flex items-center gap-1 px-2 h-7 rounded-md bg-white/[0.03] ring-1 ring-white/10 text-[11px] text-slate-300">
                      <Filter className="h-3 w-3 text-slate-500" />
                      <select value={impactFilter} onChange={(e) => setImpactFilter(e.target.value as any)}
                        className="bg-transparent outline-none text-[11px]">
                        <option value="all" className="bg-slate-900">All impact</option>
                        <option value="Low" className="bg-slate-900">Low</option>
                        <option value="Medium" className="bg-slate-900">Medium</option>
                        <option value="High" className="bg-slate-900">High</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-[14px] top-2 bottom-2 w-px bg-white/10" />
                  <ul className="space-y-1.5">
                    {filteredSteps.map((s) => {
                      const isActive = s.n === active;
                      const isDone = s.n < active;
                      const isOpen = !!expanded[s.n] || showDetails;
                      const isBookmarked = bookmarks.has(s.n);
                      return (
                        <li key={s.n}>
                          <div
                            className={`group w-full grid grid-cols-[88px_44px_1fr_minmax(220px,1fr)_120px_130px] gap-2 items-center px-2 py-2.5 rounded-lg transition cursor-pointer ${
                              isActive ? "bg-sky-500/8 ring-1 ring-sky-400/30 shadow-[0_0_30px_-18px_rgba(56,189,248,0.9)]" : "hover:bg-white/[0.03]"
                            }`}
                            onClick={() => { setActive(s.n); setExpanded((e) => ({ ...e, [s.n]: !e[s.n] })); }}
                          >
                            <div className="leading-tight">
                              <div className="text-[12px] font-mono text-slate-200">{s.time}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{s.off}</div>
                            </div>
                            <div className="relative flex items-center justify-center">
                              <span className={`h-6 w-6 rounded-full grid place-items-center text-[10px] font-bold ring-2 ${
                                isActive ? "bg-sky-500 text-white ring-sky-400/40" :
                                isDone ? "bg-emerald-500/20 text-emerald-300 ring-emerald-400/30" :
                                "bg-slate-800 text-slate-400 ring-white/10"
                              }`}>{s.n}</span>
                              {isActive && <span className="absolute inset-0 rounded-full ring-2 ring-sky-400/40 animate-ping" />}
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="h-7 w-7 rounded-md bg-white/[0.04] ring-1 ring-white/10 grid place-items-center shrink-0">
                                <s.icon className="h-3.5 w-3.5 text-sky-300" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-[12.5px] font-semibold text-white truncate flex items-center gap-1.5">
                                  {s.title}
                                  <span className="px-1.5 py-[1px] rounded bg-white/[0.04] ring-1 ring-white/10 text-[9px] text-slate-400 font-normal">{s.category}</span>
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">{s.sub}</div>
                              </div>
                            </div>
                            <div className="leading-tight min-w-0">
                              <div className="text-[10px] uppercase tracking-wider text-slate-500">Evidence</div>
                              <div className="text-[11.5px] text-slate-200 truncate">{s.evidence}</div>
                            </div>
                            <div className="leading-tight">
                              <div className="text-[10px] uppercase tracking-wider text-slate-500">Impact</div>
                              <div className={`text-[12px] font-semibold flex items-center gap-1.5 ${impactTone(s.impact)}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${impactDot(s.impact)}`} /> {s.impact}
                              </div>
                            </div>
                            <div className="leading-tight flex items-center justify-between gap-2">
                              <div className="flex-1">
                                <div className="text-[10px] uppercase tracking-wider text-slate-500">Confidence</div>
                                <div className="flex items-center gap-1.5">
                                  <div className="text-[12px] font-semibold text-white">{s.confidence}%</div>
                                  <div className="h-1 w-12 rounded bg-white/[0.05] overflow-hidden">
                                    <div className="h-full rounded bg-gradient-to-r from-sky-500 to-indigo-500" style={{ width: `${s.confidence}%` }} />
                                  </div>
                                </div>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); toggleBookmark(s.n); }}
                                className={`h-6 w-6 rounded grid place-items-center ${isBookmarked ? "text-amber-300" : "text-slate-500 hover:text-amber-300"}`}>
                                <Star className={`h-3.5 w-3.5 ${isBookmarked ? "fill-amber-300" : ""}`} />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setDrawer(s); }} className="h-6 w-6 rounded grid place-items-center text-slate-500 hover:text-sky-300">
                                <ChevronRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden">
                                <div className="ml-[140px] mr-2 mb-2 p-3 rounded-md bg-white/[0.025] border border-white/[0.06]">
                                  <div className="text-[11px] text-slate-300 leading-relaxed">{s.detail}</div>
                                  <div className="mt-2 h-1 w-full bg-white/[0.05] rounded">
                                    <div className="h-1 rounded bg-gradient-to-r from-sky-500 to-indigo-500" style={{ width: `${s.confidence}%` }} />
                                  </div>
                                  <button onClick={() => setDrawer(s)} className="mt-2 text-[10.5px] text-sky-300 hover:text-sky-200 inline-flex items-center gap-1">
                                    Open full reasoning detail <ChevronRight className="h-3 w-3" />
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </li>
                      );
                    })}
                    {filteredSteps.length === 0 && (
                      <li className="text-center py-6 text-[11.5px] text-slate-500">No steps match the current filter</li>
                    )}
                  </ul>
                </div>
              </GlassCard>

              {/* Right column */}
              <div className="col-span-12 xl:col-span-4 space-y-4">
                {/* Scenario comparison */}
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[14px] font-semibold text-white">Window Scoring</div>
                    <span className="text-[10.5px] text-slate-500">vs. Tonight pick</span>
                  </div>
                  <div className="space-y-1.5">
                    {SCENARIOS.map((sc) => {
                      const isSel = scenario === sc.id;
                      const isWinner = sc.id === "tonight";
                      return (
                        <button key={sc.id} onClick={() => setScenario(sc.id)}
                          className={`w-full p-2 rounded-lg flex items-center gap-2 transition text-left ${
                            isSel ? "bg-sky-500/10 ring-1 ring-sky-400/30" : "bg-white/[0.025] ring-1 ring-white/5 hover:bg-white/[0.04]"
                          }`}>
                          {isWinner && <Trophy className="h-3.5 w-3.5 text-amber-300 shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="text-[11.5px] font-semibold text-white truncate">{sc.label}</div>
                            <div className="h-1 w-full bg-white/[0.06] rounded mt-1 overflow-hidden">
                              <motion.div className={`h-full rounded ${isWinner ? "bg-gradient-to-r from-emerald-400 to-sky-400" : "bg-slate-500"}`}
                                initial={{ width: 0 }} animate={{ width: `${sc.score}%` }} transition={{ duration: 0.6 }} />
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[12px] font-bold text-white tabular-nums">{sc.score}</div>
                            <div className={`text-[10px] font-semibold ${sc.color}`}>{sc.delta === 0 ? "best" : `${sc.delta}`}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </GlassCard>

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
                  <button onClick={() => nav("/sead/knowledge-graph")} className="mt-2 text-[11px] text-sky-300 hover:text-sky-200 inline-flex items-center gap-1">
                    Open Knowledge Graph <ChevronRight className="h-3 w-3" />
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
          </div>
        </main>
      </div>

      <DetailDrawer item={drawer} onClose={() => setDrawer(null)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands} />
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

function ConfidenceTrend({ active, onPick }: { active: number; onPick: (n: number) => void }) {
  return (
    <div className="flex items-end gap-[3px] h-10">
      {STEPS.map((s) => {
        const h = (s.confidence / 100) * 36 + 4;
        const isActive = s.n === active;
        return (
          <button key={s.n} onClick={() => onPick(s.n)} title={`Step ${s.n}: ${s.confidence}%`}
            className={`w-2.5 rounded-t transition ${isActive ? "bg-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.7)]" : "bg-slate-600 hover:bg-slate-400"}`}
            style={{ height: `${h}px` }} />
        );
      })}
    </div>
  );
}

function SpeedMenu({ value, onChange }: { value: 1 | 2 | 4; onChange: (v: 1 | 2 | 4) => void }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(Number(e.target.value) as 1 | 2 | 4)}
        className="h-8 pl-3 pr-7 rounded-md bg-white/[0.04] border border-white/10 text-[11.5px] text-slate-200 appearance-none">
        <option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option>
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
    </div>
  );
}

function CtlBtn({ icon: Icon, onClick, primary }: any) {
  return (
    <button onClick={onClick} className={`h-8 w-8 rounded-md grid place-items-center border transition ${
      primary ? "bg-sky-500 hover:bg-sky-400 border-sky-400/40 text-white"
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

function EventTicker({ events }: { events: string[] }) {
  return (
    <div className="overflow-hidden rounded-lg ring-1 ring-white/[0.06] bg-white/[0.02] h-8 flex items-center">
      <div className="px-2.5 h-full grid place-items-center bg-sky-500/15 text-sky-300 text-[10px] font-bold uppercase tracking-wider border-r border-white/10">Trace</div>
      <div className="flex-1 overflow-hidden relative">
        <motion.div className="flex gap-10 whitespace-nowrap absolute inset-y-0 items-center"
          animate={{ x: ["0%", "-50%"] }} transition={{ duration: 45, repeat: Infinity, ease: "linear" }}>
          {[...events, ...events].map((e, i) => (
            <span key={i} className="text-[11px] text-slate-300 flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-sky-400" /> {e}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* ============================= detail drawer ============================= */
function DetailDrawer({ item, onClose }: { item: Step | "help" | null; onClose: () => void }) {
  const [tab, setTab] = useState<"100" | "200" | "300">("100");
  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
          <motion.aside initial={{ x: 480 }} animate={{ x: 0 }} exit={{ x: 480 }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed right-0 top-0 bottom-0 w-[460px] z-50 bg-[#0b0f1a] border-l border-white/10 flex flex-col">
            {item === "help" ? (
              <>
                <div className="px-5 py-4 border-b border-white/10 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-sky-300 font-semibold">Help</div>
                    <div className="text-[15px] font-semibold text-white mt-0.5">Keyboard Shortcuts</div>
                  </div>
                  <button onClick={onClose} className="h-8 w-8 rounded-md bg-white/[0.04] hover:bg-white/[0.08] grid place-items-center text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1.5 text-[12px] text-slate-300">
                  {[
                    ["⌘K / Ctrl+K", "Open command palette"],
                    ["Space", "Play / Pause playback"],
                    ["← / →", "Previous / Next step"],
                    ["Home / End", "Jump to first / last"],
                    ["1 – 9, 0", "Jump to step 1–10"],
                    ["+ / −", "Cycle playback speed"],
                    ["D", "Toggle step details"],
                    ["L", "Toggle loop"],
                    ["B", "Bookmark current step"],
                    ["E", "Export reasoning CSV"],
                    ["R", "Reset playback"],
                    ["?", "Show this help"],
                  ].map(([k, d]) => (
                    <div key={k} className="flex items-center justify-between py-1.5 border-b border-white/[0.04]">
                      <kbd className="px-2 py-0.5 rounded bg-white/[0.06] text-[11px] text-white border border-white/10">{k}</kbd>
                      <span className="text-slate-400">{d}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="px-5 py-4 border-b border-white/10 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-sky-300 font-semibold">Reasoning Step {item.n} · {item.category}</div>
                    <div className="text-[15px] font-semibold text-white mt-0.5">{item.title}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{item.time} · {item.off} · <span className={impactTone(item.impact)}>{item.impact} impact</span> · {item.confidence}% confidence</div>
                  </div>
                  <button onClick={onClose} className="h-8 w-8 rounded-md bg-white/[0.04] hover:bg-white/[0.08] grid place-items-center text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
                </div>
                <div className="px-5 pt-3 flex gap-1">
                  {(["100","200","300"] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)}
                      className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition ${
                        tab === t ? "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/40" : "text-slate-400 hover:text-white"
                      }`}>
                      {t}-Level · {t === "100" ? "Executive" : t === "200" ? "Operational" : "Engineering"}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 text-[12.5px] text-slate-300 leading-relaxed">
                  <div className="p-3 rounded-md bg-white/[0.025] ring-1 ring-white/[0.06]">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Evidence</div>
                    <div className="text-white text-[12.5px]">{item.evidence}</div>
                  </div>
                  {tab === "100" && (
                    <p><span className="text-white font-semibold">Business meaning.</span> {item.detail} This step contributed to the final 89% recommendation confidence.</p>
                  )}
                  {tab === "200" && (
                    <>
                      <p><span className="text-white font-semibold">Operational context.</span> {item.detail}</p>
                      <p><span className="text-white font-semibold">Dependencies.</span> Inputs from MES, EDA Historian, Maximo, and the Equipment Twin model.</p>
                    </>
                  )}
                  {tab === "300" && (
                    <>
                      <p><span className="text-white font-semibold">Model.</span> {item.category} pipeline · Bayesian RUL + DTW similarity, threshold ε=0.04.</p>
                      <p><span className="text-white font-semibold">Lineage.</span> Evidence hashed and pinned in immutable reasoning ledger.</p>
                      <p><span className="text-white font-semibold">Raw.</span> {item.detail}</p>
                    </>
                  )}
                </div>
              </>
            )}
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
