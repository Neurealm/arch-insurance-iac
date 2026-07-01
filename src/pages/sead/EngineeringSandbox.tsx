import { SeadRail } from "@/components/sead/SeadRail";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell, Boxes, Factory, HelpCircle, LayoutGrid, Network as NetIcon, Wrench, Sparkles, Gavel, Brain, Gauge, Lightbulb, GitBranch, Share2, Scale, Target as TargetIcon, BookOpen, Users, ArrowRight, ArrowLeft, UserCheck, Save, Share2 as ShareIcon, FileDown, Edit3, Info, CheckCircle2, Plus, Eye, Copy, Trash2, RefreshCw, FlaskConical, MessageSquare, Network,
} from "lucide-react";

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
function AppHeader() {
  return (
    <header className="flex items-center gap-4 px-6 h-[72px] border-b border-white/[0.06] bg-gradient-to-b from-white/[0.025] to-transparent backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 via-indigo-500 to-fuchsia-500 grid place-items-center shadow-[0_0_28px_-6px_rgba(99,102,241,0.7)] font-black text-white text-[15px]">N</div>
        <div className="leading-tight">
          <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400 font-semibold">Neurealm</div>
          <div className="text-[16px] font-semibold text-white tracking-tight">Engineering Sandbox</div>
          <div className="text-[11px] text-slate-400">Experiment with scenarios, test assumptions, and see how engineering decisions impact recommendations.</div>
        </div>
      </div>
      <div className="flex-1" />
      <div className="h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-[12px] text-slate-300">
        <Factory className="h-4 w-4 text-sky-300" /> Fab: DFW Semiconductor Fab
      </div>
      <div className="h-11 px-3 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center gap-2 text-[12px] text-slate-300">
        <span>May 23, 2026 10:24 AM CT</span>
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

/* ============================= slider primitive ============================= */
function ParamSlider({
  label, hint, value, onChange, min, max, step = 1, suffix = "",
  leftLabel, rightLabel, valueLabel,
}: any) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white">
            {label} <Info className="h-3 w-3 text-slate-500" />
          </div>
          {hint && <div className="text-[10.5px] text-slate-500 mt-0.5">{hint}</div>}
        </div>
        <div className="text-[11.5px] tabular-nums px-2 py-1 rounded bg-white/[0.04] border border-white/[0.06] text-slate-200 min-w-[78px] text-center">
          {valueLabel ?? `${value}${suffix}`}
        </div>
      </div>
      <div className="relative mt-3 h-6 flex items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/[0.05]" />
        <div className="absolute h-1.5 rounded-full bg-gradient-to-r from-sky-400 to-indigo-400" style={{ width: `${pct}%` }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-x-0 w-full appearance-none bg-transparent cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(56,189,248,0.35)]"
        />
      </div>
      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
        <span>{leftLabel}</span><span>{rightLabel}</span>
      </div>
    </div>
  );
}

/* ============================= helpers ============================= */
const fmtDate = (d: Date) => {
  const mm = d.toLocaleString("en-US", { month: "short" });
  return `${mm} ${d.getDate()}, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`;
};
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));

/* ============================= page ============================= */
export default function EngineeringSandbox() {
  // Parameters
  const baseStart = new Date(2026, 4, 28, 22, 0);
  const [startOffsetH, setStartOffsetH] = useState(0); // hours from May 27 8 PM .. May 29 4 AM
  const [duration, setDuration] = useState(4.0);
  const [safetyStock, setSafetyStock] = useState(6);
  const [leadTime, setLeadTime] = useState(3);
  const [failureRate, setFailureRate] = useState(9.2);
  const [priority, setPriority] = useState(70);
  const [view, setView] = useState("Maintenance & Reliability");
  const [compareTo, setCompareTo] = useState("Current Recommendation");

  const windowStart = useMemo(() => {
    const d = new Date(baseStart); d.setMinutes(d.getMinutes() + startOffsetH * 60); return d;
  }, [startOffsetH]);

  // Derived (deterministic) scoring engine
  const m = useMemo(() => {
    const startDriftH = startOffsetH;
    const durDelta = duration - 4;
    const stockDelta = safetyStock - 6;
    const leadDelta = leadTime - 3;
    const failDelta = failureRate - 9.2;
    const prioDelta = (priority - 70) / 100;

    const throughput = clamp(98.1 - durDelta * 0.18 - Math.abs(startDriftH) * 0.04 + prioDelta * 0.6, 92, 99.5);
    const risk = clamp(7.6 + failDelta * 0.35 - stockDelta * 0.08 + leadDelta * 0.05 + Math.abs(startDriftH) * 0.02, 1.5, 22);
    const mtbf = clamp(21.3 + (10 - failDelta) * 0.1 + durDelta * 0.6 + stockDelta * 0.1, 12, 32);
    const confidence = clamp(89 - Math.abs(startDriftH) * 0.5 - Math.abs(durDelta) * 0.6 - Math.abs(failDelta) * 0.4, 55, 96);
    const totalImpactM = -0.07 + startDriftH * 0.012 + durDelta * 0.025 + failDelta * 0.018 - stockDelta * 0.004;

    const label = totalImpactM <= -0.05 ? "Low" : totalImpactM <= 0.05 ? "Medium" : "High";
    return {
      throughput, risk, mtbf, confidence, totalImpactM, label,
      deltaThroughput: throughput - 98.9,
      deltaRisk: risk - 9.2,
      deltaMtbf: mtbf - 19.5,
      deltaConfidence: confidence - 92,
      deltaImpact: totalImpactM - -0.12,
    };
  }, [startOffsetH, duration, safetyStock, leadTime, failureRate, priority]);

  const drivers = useMemo(() => [
    { k: "Maintenance Window Start", v: +(startOffsetH * 0.015).toFixed(2), pos: startOffsetH >= 0 },
    { k: "Maintenance Window Duration", v: +((duration - 4) * 0.04).toFixed(2), pos: duration >= 4 },
    { k: "Pump Failure Rate", v: +(-(failureRate - 9.2) * 0.03).toFixed(2), pos: failureRate <= 9.2 },
    { k: "Safety Stock", v: +(-(safetyStock - 6) * 0.02).toFixed(2), pos: safetyStock >= 6 },
    { k: "Spare Part Lead Time", v: +(-(leadTime - 3) * 0.02).toFixed(2), pos: leadTime <= 3 },
  ].map(d => ({ ...d, abs: Math.abs(d.v) })).sort((a, b) => b.abs - a.abs), [startOffsetH, duration, safetyStock, leadTime, failureRate]);

  // chart points
  const days = 7;
  const series = useMemo(() => {
    const pts = (base: number, drift: number, slope: number) =>
      Array.from({ length: days }).map((_, i) => base + drift + slope * i);
    return {
      tp: pts(m.throughput, 0, -0.1),
      rk: pts(m.risk * 8, 4, 0.4),
      ci: pts(40 - m.totalImpactM * 80, 0, -1.6),
    };
  }, [m]);

  const xs = useMemo(() => Array.from({ length: days }).map((_, i) => {
    const d = new Date(2026, 4, 28 + i);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }), []);

  const reset = () => {
    setStartOffsetH(0); setDuration(4.0); setSafetyStock(6);
    setLeadTime(3); setFailureRate(9.2); setPriority(70);
  };

  return (
    <div className="min-h-screen bg-[#05060a] text-slate-200 selection:bg-sky-500/30">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/3 h-[520px] w-[520px] rounded-full bg-sky-600/10 blur-[140px]" />
        <div className="absolute top-1/3 -right-32 h-[420px] w-[420px] rounded-full bg-fuchsia-600/10 blur-[140px]" />
        <div className="absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <AppHeader />
      <div className="flex">
        <SeadRail />

        <main className="flex-1 p-6 space-y-6">
          {/* Top strip */}
          <GlassCard className="p-4">
            <div className="flex items-start gap-6 flex-wrap">
              <button onClick={() => history.back()} className="text-sky-300 text-[12px] inline-flex items-center gap-1.5 hover:text-sky-200 mt-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Recommendation
              </button>
              <div className="flex items-center gap-3">
                <div className="h-14 w-20 rounded-md bg-gradient-to-br from-slate-700 to-slate-900 grid place-items-center text-[10px] text-slate-400">CHAMBER</div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-white font-semibold text-[15px]">ETCH-217</div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">Fair</span>
                  </div>
                  <div className="text-[11px] text-slate-400">Metal Etch Chamber | Bay 2</div>
                  <div className="text-[11px] text-slate-400">Focus: Vacuum Pump Degradation</div>
                </div>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Current Recommendation</div>
                <div className="text-white font-semibold text-[13.5px] mt-0.5">Maintain Tonight</div>
                <div className="text-[11px] text-slate-400">May 28, 10:00 PM – May 29, 2:00 AM</div>
                <div className="mt-1 inline-block px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10.5px]">Recommended</div>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Overall Confidence</div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="text-emerald-300 font-semibold text-[24px] tabular-nums">{m.confidence.toFixed(0)}%</div>
                  <svg viewBox="0 0 80 50" className="h-10 w-16">
                    <path d="M5 45 A35 35 0 0 1 75 45" stroke="#1e293b" strokeWidth="6" fill="none" />
                    <path d="M5 45 A35 35 0 0 1 75 45" stroke="#34d399" strokeWidth="6" fill="none"
                      strokeDasharray="110" strokeDashoffset={110 - (m.confidence / 100) * 110} strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-[11px] text-emerald-300">High</div>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400">Overall Impact</div>
                <div className={`font-semibold text-[22px] mt-0.5 ${m.label === "Low" ? "text-emerald-300" : m.label === "Medium" ? "text-amber-300" : "text-rose-300"}`}>{m.label}</div>
                <div className="text-[11px] text-slate-400">({m.totalImpactM >= 0 ? "+" : "-"}${Math.abs(m.totalImpactM).toFixed(2)}M)</div>
              </div>
              <div className="flex-1" />
              <div className="flex flex-col items-stretch gap-2 min-w-[230px]">
                <div className="flex items-center gap-2">
                  <button className="flex-1 h-9 rounded-md bg-white/[0.03] border border-white/[0.06] text-[12px] text-slate-200 inline-flex items-center justify-center gap-1.5 hover:bg-white/[0.06]"><Save className="h-3.5 w-3.5" /> Save Experiment</button>
                  <button className="flex-1 h-9 rounded-md bg-white/[0.03] border border-white/[0.06] text-[12px] text-slate-200 inline-flex items-center justify-center gap-1.5 hover:bg-white/[0.06]"><ShareIcon className="h-3.5 w-3.5" /> Share</button>
                  <button className="flex-1 h-9 rounded-md bg-sky-500/15 border border-sky-400/30 text-[12px] text-sky-200 inline-flex items-center justify-center gap-1.5 hover:bg-sky-500/25"><FileDown className="h-3.5 w-3.5" /> Export Report</button>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">Experiment Name</div>
                  <div className="flex items-center gap-2 h-9 rounded-md bg-white/[0.03] border border-white/[0.06] px-2 text-[12px] text-slate-200">
                    <input defaultValue="New Experiment 1" className="bg-transparent flex-1 outline-none" />
                    <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">Last saved: 2 minutes ago</div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Row: Parameters | Outcomes | Assumptions */}
          <div className="grid grid-cols-12 gap-6">
            {/* 1. Adjust Parameters */}
            <GlassCard className="col-span-4 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold text-[14px]">1. Adjust Parameters</div>
                  <div className="text-[11px] text-slate-400">Select a parameter to adjust its value and see the impact.</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px]">
                <span className="text-slate-400">View by</span>
                <select value={view} onChange={(e) => setView(e.target.value)}
                  className="flex-1 h-8 rounded-md bg-white/[0.03] border border-white/[0.06] px-2 text-slate-200 outline-none">
                  <option>Maintenance & Reliability</option>
                  <option>Production</option>
                  <option>Supply Chain</option>
                </select>
              </div>

              <div className="mt-3 space-y-2.5">
                <ParamSlider
                  label="Maintenance Window Start (Date/Time)" hint="May 28, 10:00 PM"
                  value={startOffsetH} onChange={setStartOffsetH} min={-26} max={6} step={1}
                  leftLabel="May 27, 8 PM" rightLabel="May 29, 4 AM"
                  valueLabel={fmtDate(windowStart)}
                />
                <ParamSlider
                  label="Maintenance Window Duration"
                  value={duration} onChange={setDuration} min={2} max={12} step={0.5}
                  leftLabel="2 hrs" rightLabel="12 hrs" valueLabel={`${duration.toFixed(1)} hrs`}
                />
                <ParamSlider
                  label="Safety Stock (Critical Spares)" hint="current: 6 units"
                  value={safetyStock} onChange={setSafetyStock} min={2} max={14} step={1}
                  leftLabel="2 days" rightLabel="14 days" valueLabel={`${safetyStock} days`}
                />
                <ParamSlider
                  label="Spare Part Lead Time"
                  value={leadTime} onChange={setLeadTime} min={1} max={10} step={1}
                  leftLabel="1 day" rightLabel="10 days" valueLabel={`${leadTime} days`}
                />
                <ParamSlider
                  label="Pump Failure Rate (Degradation Model)"
                  value={failureRate} onChange={setFailureRate} min={5} max={20} step={0.1}
                  leftLabel="5%" rightLabel="20%" valueLabel={`${failureRate.toFixed(1)}%`}
                />
                <ParamSlider
                  label="Production Priority"
                  value={priority} onChange={setPriority} min={0} max={100} step={5}
                  leftLabel="Low" rightLabel="High"
                  valueLabel={priority < 34 ? "Low" : priority < 67 ? "Medium" : "High"}
                />
              </div>
              <button className="mt-3 w-full h-9 rounded-md border border-dashed border-white/10 text-[12px] text-sky-300 inline-flex items-center justify-center gap-1.5 hover:bg-white/[0.03]">
                <Plus className="h-3.5 w-3.5" /> Add Custom Parameter
              </button>
            </GlassCard>

            {/* 2. Scenario Outcome Preview */}
            <GlassCard className="col-span-5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold text-[14px]">2. Scenario Outcome Preview</div>
                  <div className="text-[11px] text-slate-400">See how changes to parameters impact key outcomes.</div>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-400">Compare to:</span>
                  <select value={compareTo} onChange={(e) => setCompareTo(e.target.value)}
                    className="h-8 rounded-md bg-white/[0.03] border border-white/[0.06] px-2 text-slate-200 outline-none">
                    <option>Current Recommendation</option>
                    <option>Baseline (Last Week)</option>
                    <option>Conservative Plan</option>
                  </select>
                  <button onClick={reset} className="h-8 px-2 rounded-md border border-white/[0.06] text-slate-300 inline-flex items-center gap-1 hover:bg-white/[0.04]">
                    <RefreshCw className="h-3 w-3" /> Reset
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-5 gap-2">
                {[
                  { l: "Total Impact", v: `${m.totalImpactM >= 0 ? "+" : "-"}$${Math.abs(m.totalImpactM).toFixed(2)}M`, sub: m.label, sc: m.label === "Low" ? "text-emerald-300" : m.label === "Medium" ? "text-amber-300" : "text-rose-300", d: `${m.deltaImpact >= 0 ? "+" : ""}$${m.deltaImpact.toFixed(2)}M`, dc: m.deltaImpact <= 0 ? "text-emerald-300" : "text-rose-300" },
                  { l: "Production Throughput", v: `${m.throughput.toFixed(1)}%`, sc: "text-white", d: `${m.deltaThroughput >= 0 ? "+" : ""}${m.deltaThroughput.toFixed(1)}%`, dc: m.deltaThroughput >= 0 ? "text-emerald-300" : "text-rose-300" },
                  { l: "Risk (Failure Probability)", v: `${m.risk.toFixed(1)}%`, sc: "text-white", d: `${m.deltaRisk >= 0 ? "+" : ""}${m.deltaRisk.toFixed(1)}%`, dc: m.deltaRisk <= 0 ? "text-emerald-300" : "text-rose-300" },
                  { l: "MTBF", v: `${m.mtbf.toFixed(1)} days`, sc: "text-white", d: `${m.deltaMtbf >= 0 ? "+" : ""}${m.deltaMtbf.toFixed(1)} days`, dc: m.deltaMtbf >= 0 ? "text-emerald-300" : "text-rose-300" },
                  { l: "Confidence", v: `${m.confidence.toFixed(0)}%`, sc: "text-white", d: `${m.deltaConfidence >= 0 ? "+" : ""}${m.deltaConfidence.toFixed(0)}%`, dc: m.deltaConfidence >= 0 ? "text-emerald-300" : "text-rose-300" },
                ].map((c) => (
                  <div key={c.l} className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-3">
                    <div className="text-[10.5px] text-slate-400 leading-tight">{c.l}</div>
                    <div className={`mt-1 font-semibold text-[15px] tabular-nums ${c.sc}`}>{c.v}</div>
                    {c.sub && <div className="text-[10px] text-slate-400">({c.sub})</div>}
                    <div className="mt-2 text-[10px] text-slate-500">vs. baseline <span className={`ml-1 ${c.dc}`}>{c.d}</span></div>
                  </div>
                ))}
              </div>

              {/* Mini chart */}
              <div className="mt-5">
                <div className="text-[11.5px] text-white font-semibold">Impact Over Time (7 Days)</div>
                <svg viewBox="0 0 520 200" className="w-full h-[210px] mt-2">
                  {[40, 100, 160].map((y) => <line key={y} x1="40" x2="510" y1={y} y2={y} stroke="#1e293b" strokeDasharray="2 4" />)}
                  {["High", "Neutral", "Low"].map((l, i) => <text key={l} x="6" y={45 + i * 60} fill="#64748b" fontSize="9">{l}</text>)}
                  {xs.map((x, i) => <text key={x} x={50 + i * 75} y="195" fill="#64748b" fontSize="9" textAnchor="middle">{x}</text>)}
                  {/* Throughput line */}
                  <polyline fill="none" stroke="#38bdf8" strokeWidth="2"
                    points={series.tp.map((v, i) => `${50 + i * 75},${clamp(160 - (v - 92) * 12, 20, 175)}`).join(" ")} />
                  {/* Risk line */}
                  <polyline fill="none" stroke="#c084fc" strokeWidth="2"
                    points={series.rk.map((v, i) => `${50 + i * 75},${clamp(160 - v * 1.2, 20, 175)}`).join(" ")} />
                  {/* Cost dashed */}
                  <polyline fill="none" stroke="#a3e635" strokeWidth="2" strokeDasharray="5 4"
                    points={series.ci.map((v, i) => `${50 + i * 75},${clamp(160 - v * 0.8, 20, 175)}`).join(" ")} />
                  {/* dots */}
                  {series.tp.map((v, i) => <circle key={`tp${i}`} cx={50 + i * 75} cy={clamp(160 - (v - 92) * 12, 20, 175)} r="2.5" fill="#38bdf8" />)}
                  {series.rk.map((v, i) => <circle key={`rk${i}`} cx={50 + i * 75} cy={clamp(160 - v * 1.2, 20, 175)} r="2.5" fill="#c084fc" />)}
                </svg>
                <div className="flex items-center gap-4 text-[10.5px] text-slate-400 mt-1">
                  <span className="inline-flex items-center gap-1"><span className="h-1.5 w-3 bg-sky-400 rounded" /> Production Throughput</span>
                  <span className="inline-flex items-center gap-1"><span className="h-1.5 w-3 bg-fuchsia-400 rounded" /> Risk (Failure Probability)</span>
                  <span className="inline-flex items-center gap-1"><span className="h-0.5 w-3 bg-lime-400 rounded" /> Total Cost Impact (M$)</span>
                </div>
              </div>
            </GlassCard>

            {/* 3. Assumptions & Constraints */}
            <GlassCard className="col-span-3 p-5 space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-white font-semibold text-[14px]">3. Assumptions & Constraints</div>
                  <button className="text-[11px] text-sky-300">Edit</button>
                </div>
                <div className="text-[11px] text-slate-400 mt-2 font-semibold">Active Assumptions</div>
                <ul className="mt-2 space-y-2 text-[11.5px] text-slate-200">
                  {["No major equipment failures in parallel", "Sufficient technician availability", "Parts are available by lead time", "No change in demand forecast"].map((a) => (
                    <li key={a} className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300 mt-0.5" />{a}</li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-white/[0.06] pt-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 font-semibold">Constraints</div>
                  <button className="text-[11px] text-sky-300">Edit</button>
                </div>
                <ul className="mt-2 space-y-2 text-[11.5px] text-slate-200">
                  {["Maintenance must occur within 5 days", "Max maintenance window: 12 hours", "Budget impact must remain < $0.5M", "Risk (Failure Probability) < 15%"].map((a) => (
                    <li key={a} className="flex items-start gap-2"><Info className="h-3.5 w-3.5 text-sky-300 mt-0.5" />{a}</li>
                  ))}
                </ul>
              </div>

              {/* 4. Drivers */}
              <div className="border-t border-white/[0.06] pt-3">
                <div className="text-white font-semibold text-[13.5px]">4. What's Driving the Change?</div>
                <div className="text-[11px] text-slate-400">Top factors influencing the outcome vs. baseline.</div>
                <div className="mt-3 space-y-2">
                  {drivers.map((d) => (
                    <div key={d.k} className="text-[11px]">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>{d.k}</span>
                        <span className={`tabular-nums ${d.pos ? "text-emerald-300" : "text-rose-300"}`}>{d.v >= 0 ? "+" : ""}{d.v.toFixed(2)}</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden relative">
                        <div className={`absolute top-0 h-full ${d.pos ? "bg-emerald-400 left-1/2" : "bg-rose-400 right-1/2"}`}
                          style={{ width: `${clamp(d.abs * 400, 4, 50)}%` }} />
                        <div className="absolute left-1/2 top-0 h-full w-px bg-white/20" />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-3 text-[11px] text-sky-300 inline-flex items-center gap-1">View all drivers <ArrowRight className="h-3 w-3" /></button>
              </div>
            </GlassCard>
          </div>

          {/* Row: Recommended action / Sensitivity */}
          <div className="grid grid-cols-12 gap-6">
            <GlassCard className="col-span-7 p-5">
              <div className="text-white font-semibold text-[14px]">5. Recommended Actions in This Scenario</div>
              <div className="text-[11px] text-slate-400">Based on your parameter changes, here's the recommended action.</div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/[0.05] p-4">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Sparkles className="h-4 w-4" /> <span className="font-semibold text-[12.5px]">New Recommended Window</span>
                  </div>
                  <div className="mt-2 text-white font-semibold text-[14px]">{fmtDate(windowStart)} – {fmtDate(new Date(windowStart.getTime() + duration * 3600 * 1000))} ({duration.toFixed(1)} hrs)</div>
                  <div className="mt-3 flex items-center gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-slate-200">Confidence: {m.confidence.toFixed(0)}%</span>
                    <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-slate-200">Impact: <span className={m.label === "Low" ? "text-emerald-300" : m.label === "Medium" ? "text-amber-300" : "text-rose-300"}>{m.label}</span> ({m.totalImpactM >= 0 ? "+" : "-"}${Math.abs(m.totalImpactM).toFixed(2)}M)</span>
                  </div>
                </div>
                <div>
                  <div className="text-[12px] text-slate-300 font-semibold">Key Reasons</div>
                  <ul className="mt-2 space-y-1.5 text-[12px] text-slate-200">
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300 mt-0.5" />Lower failure probability during this window</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300 mt-0.5" />Minimal impact to production throughput</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-300 mt-0.5" />Optimal balance of risk and cost</li>
                  </ul>
                  <button className="mt-3 text-[11px] text-sky-300 inline-flex items-center gap-1"><Eye className="h-3 w-3" /> View details</button>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="col-span-5 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold text-[14px]">7. Parameter Sensitivity</div>
                  <div className="text-[11px] text-slate-400">See which parameters have the most impact on outcomes.</div>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-400">Metric</span>
                  <select className="h-8 rounded-md bg-white/[0.03] border border-white/[0.06] px-2 text-slate-200 outline-none">
                    <option>Total Impact</option><option>Risk</option><option>Throughput</option>
                  </select>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {[
                  { k: "Maintenance Window Start", v: "High", w: 92, c: "from-fuchsia-500 to-violet-400" },
                  { k: "Maintenance Window Duration", v: "High", w: 84, c: "from-fuchsia-500 to-violet-400" },
                  { k: "Pump Failure Rate", v: "Medium", w: 58, c: "from-violet-500 to-indigo-400" },
                  { k: "Safety Stock", v: "Medium", w: 48, c: "from-violet-500 to-indigo-400" },
                  { k: "Spare Part Lead Time", v: "Low", w: 26, c: "from-indigo-500 to-sky-400" },
                  { k: "Production Priority", v: "Low", w: 18, c: "from-indigo-500 to-sky-400" },
                ].map((r) => (
                  <div key={r.k} className="grid grid-cols-12 items-center gap-3">
                    <div className="col-span-4 text-[11.5px] text-slate-300">{r.k}</div>
                    <div className="col-span-2 text-[11px] text-slate-400">{r.v}</div>
                    <div className="col-span-6 h-2 rounded-full bg-white/[0.05] overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${r.c}`} style={{ width: `${r.w}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500">
                <span>Low Impact</span><span>Medium Impact</span><span>High Impact</span>
              </div>
            </GlassCard>
          </div>

          {/* Scenario Management */}
          <GlassCard className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold text-[14px]">6. Scenario Management</div>
                <div className="text-[11px] text-slate-400">Your saved experiments</div>
              </div>
              <button className="h-8 px-3 rounded-md bg-sky-500/15 border border-sky-400/30 text-[12px] text-sky-200 inline-flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" /> New Experiment
              </button>
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border border-white/[0.06]">
              <table className="w-full text-[12px]">
                <thead className="bg-white/[0.02] text-slate-400 text-[11px]">
                  <tr>
                    <th className="text-left font-medium px-3 py-2">Name</th>
                    <th className="text-left font-medium px-3 py-2">Last Modified</th>
                    <th className="text-left font-medium px-3 py-2">Parameters Changed</th>
                    <th className="text-left font-medium px-3 py-2">Total Impact</th>
                    <th className="text-left font-medium px-3 py-2">Confidence</th>
                    <th className="text-left font-medium px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { n: "Experiment 1 (Current)", d: "May 23, 2026 10:22 AM", p: 3, im: "Low (–$0.07M)", ic: "text-emerald-300", cf: "86%" },
                    { n: "Earlier Window Test", d: "May 23, 2026 9:45 AM", p: 2, im: "Medium (+$0.12M)", ic: "text-amber-300", cf: "83%" },
                    { n: "Longer Duration Test", d: "May 22, 2026 4:15 PM", p: 2, im: "Low (–$0.03M)", ic: "text-emerald-300", cf: "88%" },
                  ].map((r) => (
                    <tr key={r.n} className="border-t border-white/[0.06] hover:bg-white/[0.02]">
                      <td className="px-3 py-2.5 text-slate-200">{r.n}</td>
                      <td className="px-3 py-2.5 text-slate-400">{r.d}</td>
                      <td className="px-3 py-2.5 text-slate-300 tabular-nums">{r.p}</td>
                      <td className={`px-3 py-2.5 ${r.ic}`}>{r.im}</td>
                      <td className="px-3 py-2.5 text-slate-300 tabular-nums">{r.cf}</td>
                      <td className="px-3 py-2.5 text-slate-400">
                        <div className="inline-flex items-center gap-2">
                          <button className="h-7 w-7 rounded-md hover:bg-white/[0.05] grid place-items-center" title="View"><Eye className="h-3.5 w-3.5" /></button>
                          <button className="h-7 w-7 rounded-md hover:bg-white/[0.05] grid place-items-center" title="Duplicate"><Copy className="h-3.5 w-3.5" /></button>
                          <button className="h-7 w-7 rounded-md hover:bg-white/[0.05] grid place-items-center" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="mt-3 text-[11px] text-sky-300 inline-flex items-center gap-1">View all experiments <ArrowRight className="h-3 w-3" /></button>
          </GlassCard>

          <div className="h-4" />
        </main>
      </div>
    </div>
  );
}
