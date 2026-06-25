import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell, Boxes, ChevronDown, Factory, HelpCircle, LayoutGrid, Network as NetIcon,
  Wrench, Sparkles, Gavel, Brain, ArrowLeft, Gauge, Lightbulb, GitBranch, Share2, Star, Activity,
  ShieldCheck, Users, Zap, Briefcase, Box, CheckCircle2, Database, BookOpen,
  TrendingUp, Target, Clock, DollarSign, Download, Play, BarChart3, Wallet, Scale, Target as TargetIcon, UserCheck, FlaskConical, MessageSquare} from "lucide-react";
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
  { icon: Brain, label: "AI Reasoning", to: "/sead/ai-reasoning-playback" },
  { icon: Gauge, label: "Confidence\nExplorer", to: "/sead/confidence-explorer" },
  { icon: Lightbulb, label: "Explainability", to: "/sead/explainability", active: true },
  { icon: GitBranch, label: "What If", to: "/sead/what-if" },
  { icon: Share2, label: "Knowledge\nGraph", to: "/sead/knowledge-graph" },
  { icon: BookOpen, label: "Operational\nLearning", to: "/sead/operational-learning" },
  { icon: TargetIcon, label: "Outcome\nTracker", to: "/sead/outcome-tracker" },
  { icon: Users, label: "Multi-Agent\nCollaboration", to: "/sead/multi-agent-collaboration" },
  { icon: UserCheck, label: "Human-\nin-the-Loop", to: "/sead/human-in-the-loop" },
  { icon: FlaskConical, label: "Engineering\nSandbox", to: "/sead/engineering-sandbox" },
  { icon: MessageSquare, label: "Digital Coworker\nConversation", to: "/sead/digital-coworker-conversation" },
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
            <motion.span layoutId="rail-expl-indicator"
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
          <div className="text-[16px] font-semibold text-white tracking-tight">Explainability</div>
          <div className="text-[11px] text-slate-400">Understand exactly why NeuGAIN recommends this maintenance window</div>
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

/* ============================= data ============================= */
const FACTORS = [
  { icon: TrendingUp, name: "Production Impact",        sub: "Low impact to throughput and WIP",        tag: "Low",           color: "#38bdf8", v: 23 },
  { icon: ShieldCheck, name: "Tool Health & Risk",      sub: "Addresses rising risk before threshold",  tag: "Low Risk",      color: "#22c55e", v: 21 },
  { icon: Users,       name: "Dispatch & Resources",    sub: "Technicians, tools, and parts available", tag: "High Fit",      color: "#a855f7", v: 16 },
  { icon: Box,         name: "Alternate Tool Availability", sub: "Sufficient qualified alternate capacity", tag: "Good",      color: "#14b8a6", v: 12 },
  { icon: Zap,         name: "Utilities & Facilities",  sub: "No conflicts with utility constraints",   tag: "Good",          color: "#14b8a6", v: 11 },
  { icon: Briefcase,   name: "Business Commitments",    sub: "Meets customer and internal commitments", tag: "On Track",      color: "#f59e0b", v: 9 },
  { icon: Target,      name: "Quality & Yield Risk",    sub: "Maintains yield and quality targets",     tag: "Low Risk",      color: "#22c55e", v: 5 },
  { icon: BookOpen,    name: "Historical Patterns",     sub: "Consistent with successful past events",  tag: "Strong Match",  color: "#22c55e", v: 3 },
];

const STEPS = [
  { t: "09:42:13", title: "Analyzed live equipment telemetry",   sub: "Detected early degradation in vacuum pump vibration.",            chip: "Data",       icon: Database,  color: "text-sky-300 bg-sky-500/10 border-sky-400/30" },
  { t: "09:42:15", title: "Matched historical degradation patterns", sub: "6 similar events found, 5 resolved with this window type.",  chip: "Historical", icon: BookOpen,  color: "text-amber-300 bg-amber-500/10 border-amber-400/30" },
  { t: "09:42:18", title: "Evaluated production context",       sub: "12 lots in queue, 2 customer shipments at risk if delayed.",       chip: "Context",    icon: BarChart3, color: "text-emerald-300 bg-emerald-500/10 border-emerald-400/30" },
  { t: "09:42:20", title: "Checked alternate tools",            sub: "2 qualified tools available, capacity constraint on ETCH-221.",    chip: "Resources",  icon: Users,     color: "text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-400/30" },
  { t: "09:42:22", title: "Assessed utilities & facilities",    sub: "DI water stable, N2 available, no planned outages.",               chip: "Utilities",  icon: Zap,       color: "text-yellow-300 bg-yellow-500/10 border-yellow-400/30" },
  { t: "09:42:24", title: "Reviewed business commitments",      sub: "All customer commitments met with this window.",                   chip: "Business",   icon: Briefcase, color: "text-orange-300 bg-orange-500/10 border-orange-400/30" },
  { t: "09:42:25", title: "Simulated scenarios",                sub: "Evaluated 312 scenarios across 9 impact dimensions.",              chip: "Simulation", icon: Box,       color: "text-rose-300 bg-rose-500/10 border-rose-400/30" },
  { t: "09:42:26", title: "Scored and selected optimal window", sub: "This window scored 91/100 with lowest total impact.",              chip: "Decision",   icon: CheckCircle2, color: "text-emerald-300 bg-emerald-500/10 border-emerald-400/30" },
];

const EVIDENCE = [
  { title: "Vacuum pump vibration trending upward",         sub: "Rate of change within early failure window.",            tag: "Supporting", impact: "High",   c: "emerald" },
  { title: "6 similar historical events found",              sub: "5 resolved successfully with similar maintenance window.", tag: "Supporting", impact: "High",   c: "emerald" },
  { title: "WIP in queue is below daily capacity",           sub: "Can absorb 4-hr maintenance window.",                    tag: "Supporting", impact: "Medium", c: "emerald" },
  { title: "2 qualified alternate tools available",          sub: "ETCH-211 and ETCH-213 meet process requirements.",       tag: "Supporting", impact: "Medium", c: "emerald" },
  { title: "No planned utility outages",                     sub: "DI water, N2, CDA all stable during window.",            tag: "Supporting", impact: "Medium", c: "emerald" },
  { title: "All customer commitments on track",              sub: "No shipment or milestone conflicts.",                    tag: "Supporting", impact: "High",   c: "emerald" },
  { title: "Operator availability limited on May 27",        sub: "Would increase risk of delay or extension.",             tag: "Against\n(Considered)", impact: "Low",    c: "rose" },
  { title: "Engineering change window on May 30",            sub: "Change freeze increases risk if maintenance delayed.",   tag: "Against\n(Considered)", impact: "Medium", c: "rose" },
];

const META = [
  { icon: TrendingUp, label: "Throughput",      v: "-0.3%",  sub: "Minimal impact",  c: "text-emerald-300" },
  { icon: Target,     label: "Yield",          v: "+0.02%", sub: "Protected",       c: "text-emerald-300" },
  { icon: CheckCircle2, label: "On-Time Delivery", v: "0 lots", sub: "No risk",      c: "text-emerald-300" },
  { icon: Wallet,     label: "Maintenance Cost", v: "$8.7K",  sub: "Optimized",     c: "text-emerald-300" },
  { icon: Clock,      label: "Downtime",        v: "4.0 hrs", sub: "Minimized",     c: "text-emerald-300" },
  { icon: DollarSign, label: "Utility Cost",    v: "$1.2K",   sub: "Optimized",     c: "text-emerald-300" },
];

const EVIDENCE_TABS = ["All Evidence", "Supporting", "Neutral", "Against Considered"];

/* ============================= small parts ============================= */
function Bar({ value, color = "#22c55e", w = 100 }: any) {
  return (
    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden" style={{ width: w }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(value*4, 100)}%` }} transition={{ duration: 0.9, ease: "easeOut" }}
        style={{ background: color }} className="h-full rounded-full" />
    </div>
  );
}

function FactorRow({ f }: any) {
  return (
    <div className="grid grid-cols-12 items-center gap-2 py-2 border-b border-white/[0.04] last:border-0">
      <div className="col-span-1 grid place-items-center">
        <div className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.06] grid place-items-center text-slate-300">
          <f.icon className="h-4 w-4" />
        </div>
      </div>
      <div className="col-span-5 min-w-0">
        <div className="text-[12px] text-white font-medium">{f.name}</div>
        <div className="text-[10.5px] text-slate-500">{f.sub}</div>
      </div>
      <div className="col-span-3 text-[10.5px] font-semibold" style={{ color: f.color }}>{f.tag}</div>
      <div className="col-span-2"><Bar value={f.v} color={f.color} w={90} /></div>
      <div className="col-span-1 text-right text-[12px] font-semibold text-white tabular-nums">{f.v}%</div>
    </div>
  );
}

function Sparkline({ color = "#22c55e" }: any) {
  const pts = [8, 9, 7, 10, 12, 11, 14, 13, 15, 14, 16, 18];
  const max = Math.max(...pts), min = Math.min(...pts);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${(i / (pts.length - 1)) * 100} ${30 - ((p - min) / (max - min)) * 26}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" className="w-full h-7">
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ============================= page ============================= */
export default function Explainability() {
  const nav = useNavigate();
  const [evTab, setEvTab] = useState("All Evidence");

  const filtered = EVIDENCE.filter(e => {
    if (evTab === "All Evidence") return true;
    if (evTab === "Supporting") return e.tag === "Supporting";
    if (evTab === "Against Considered") return e.tag.startsWith("Against");
    return false;
  });

  return (
    <div className="min-h-screen bg-[#070912] text-slate-200 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-32 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-3xl" />

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
                  <div className="text-[32px] font-bold text-white leading-none mt-1 tabular-nums">89%</div>
                </div>
                <svg width="90" height="56" viewBox="0 0 90 56">
                  <path d="M 8 50 A 37 37 0 0 1 82 50" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" strokeLinecap="round" />
                  <path d="M 8 50 A 37 37 0 0 1 82 50" stroke="#22c55e" strokeWidth="8" fill="none" strokeLinecap="round"
                    strokeDasharray="116" strokeDashoffset={116 - (89/100) * 116} />
                  <g transform="translate(45 50) rotate(70)">
                    <line x1="0" y1="0" x2="0" y2="-30" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    <circle r="3" fill="#fff" />
                  </g>
                </svg>
              </div>
              <div className="col-span-2">
                <div className="text-[10.5px] uppercase tracking-wider text-slate-500">Overall Impact</div>
                <div className="text-[28px] font-bold text-emerald-300 leading-none mt-1">Low</div>
                <div className="text-[11px] text-slate-400 mt-1">(-$0.12M)</div>
              </div>
              <div className="col-span-2">
                <div className="text-[12px] text-white font-semibold">In simple terms</div>
                <div className="text-[11px] text-slate-400 mt-1">This window provides the best balance of lowest total impact, minimal risk, and highest ability to complete, based on all available data and simulations.</div>
                <button className="mt-1 text-[11px] text-sky-300 hover:text-sky-200 inline-flex items-center gap-1">How we explain recommendations →</button>
              </div>
            </div>
          </GlassCard>

          {/* MAIN 3-COL */}
          <div className="grid grid-cols-12 gap-5">

            {/* LEFT: Recommendation breakdown */}
            <div className="col-span-4">
              <GlassCard className="p-5">
                <div className="text-[13.5px] font-semibold text-white">Recommendation</div>
                <div className="flex items-center gap-2 mt-3">
                  <Star className="h-4 w-4 text-amber-300 fill-amber-300" />
                  <div className="text-[16px] font-semibold text-white">Maintain ETCH-217</div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-[13px] text-slate-300">May 28, 10:00 PM – May 29, 2:00 AM</div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">Recommended</span>
                </div>

                <div className="mt-4 rounded-xl border border-white/[0.05] bg-white/[0.015] p-3">
                  <div className="text-[12.5px] font-semibold text-white">Why this is the best window</div>
                  <div className="text-[11px] text-slate-400 leading-snug mt-0.5">NeuGAIN evaluated thousands of possibilities and this window optimized what matters most to your factory.</div>

                  <div className="mt-2">
                    {FACTORS.map((f) => <FactorRow key={f.name} f={f} />)}
                  </div>

                  <div className="grid grid-cols-12 items-center pt-3 mt-1 border-t border-white/[0.06]">
                    <div className="col-span-6 text-[12.5px] font-semibold text-white">Total</div>
                    <div className="col-span-6 text-right text-[14px] font-bold text-sky-300 tabular-nums">100%</div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* CENTER: Reasoning timeline + trade-offs */}
            <div className="col-span-4 space-y-5">
              <GlassCard className="p-5">
                <div className="flex items-center justify-between">
                  <div className="text-[13.5px] font-semibold text-white">How NeuGAIN Reached This Recommendation</div>
                  <button onClick={() => nav("/sead/ai-reasoning-playback")}
                    className="text-[11px] text-sky-300 hover:text-sky-200 inline-flex items-center gap-1">
                    <Play className="h-3 w-3" /> Replay reasoning
                  </button>
                </div>

                <div className="mt-3 relative">
                  <div className="absolute left-[14px] top-2 bottom-2 w-px bg-gradient-to-b from-sky-400/40 via-white/[0.06] to-transparent" />
                  {STEPS.map((s, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-start gap-3 py-2 relative">
                      <div className="h-7 w-7 shrink-0 rounded-full bg-white/[0.04] border border-white/[0.08] grid place-items-center text-[11px] font-semibold text-slate-300 z-10">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10.5px] text-slate-500 tabular-nums">{s.t}</span>
                          <span className="text-[12px] text-white font-medium">{s.title}</span>
                        </div>
                        <div className="text-[10.5px] text-slate-500 mt-0.5">{s.sub}</div>
                      </div>
                      <div className={`shrink-0 inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-md border ${s.color}`}>
                        {s.chip}
                        <s.icon className="h-3 w-3" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-5">
                <div className="text-[13.5px] font-semibold text-white">Key Trade-offs Considered</div>
                <div className="relative h-[180px] mt-3 rounded-lg border border-white/[0.05] bg-white/[0.015]">
                  {/* axes */}
                  <div className="absolute left-3 top-3 text-[9px] text-slate-500">Higher Impact</div>
                  <div className="absolute left-3 bottom-3 text-[9px] text-slate-500">Lower Impact</div>
                  <div className="absolute right-3 bottom-3 text-[9px] text-slate-500">Higher Risk</div>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-3 text-[9px] text-slate-500">Lower Risk</div>
                  <div className="absolute inset-0">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                      <line x1="10" y1="90" x2="95" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />
                      <line x1="10" y1="10" x2="10" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" />
                    </svg>
                  </div>
                  {/* points */}
                  <div className="absolute left-[18%] top-[55%]">
                    <div className="h-3 w-3 rounded-full bg-sky-400 ring-4 ring-sky-400/20" />
                    <div className="text-[9.5px] text-white mt-1 whitespace-nowrap -translate-x-1/4">May 28, 10 PM – May 29, 2 AM</div>
                    <div className="text-[9px] text-emerald-300 -translate-x-1/4">(Recommended)</div>
                  </div>
                  <div className="absolute left-[55%] top-[28%]">
                    <div className="h-3 w-3 rounded-full bg-amber-400 ring-4 ring-amber-400/15" />
                    <div className="text-[9.5px] text-slate-300 mt-1 whitespace-nowrap">May 29, 10 PM – May 30, 2 AM</div>
                    <div className="text-[9px] text-slate-500">Higher production impact</div>
                  </div>
                  <div className="absolute left-[78%] top-[45%]">
                    <div className="h-3 w-3 rounded-full bg-rose-400 ring-4 ring-rose-400/15" />
                    <div className="text-[9.5px] text-slate-300 mt-1 whitespace-nowrap -translate-x-1/2">May 30, 10 PM – May 31, 2 AM</div>
                    <div className="text-[9px] text-slate-500 -translate-x-1/2">Higher tool risk</div>
                  </div>
                  <div className="absolute left-[38%] top-[72%]">
                    <div className="h-3 w-3 rounded-full bg-slate-400 ring-4 ring-slate-400/15" />
                    <div className="text-[9.5px] text-slate-300 mt-1 whitespace-nowrap">May 27, 10 PM – May 28, 2 AM</div>
                    <div className="text-[9px] text-slate-500">Higher utility risk</div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* RIGHT: Evidence */}
            <div className="col-span-4">
              <GlassCard className="p-5 h-full">
                <div className="text-[13.5px] font-semibold text-white">Evidence Behind the Recommendation</div>
                <div className="grid grid-cols-4 gap-1 mt-3 p-1 rounded-lg bg-white/[0.03] border border-white/[0.05]">
                  {EVIDENCE_TABS.map((t) => (
                    <button key={t} onClick={() => setEvTab(t)}
                      className={`text-[11px] py-1.5 rounded-md transition ${evTab === t ? "bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/30" : "text-slate-400 hover:text-white"}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <div className="mt-3 space-y-1.5">
                  {filtered.map((e) => (
                    <div key={e.title} className="flex items-start gap-2 px-3 py-2.5 rounded-lg border border-white/[0.05] bg-white/[0.02]">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${e.c === "emerald" ? "text-emerald-300" : "text-rose-300"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] text-white">{e.title}</div>
                        <div className="text-[10.5px] text-slate-400">{e.sub}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-[10px] whitespace-pre-line leading-tight ${e.c === "emerald" ? "text-emerald-300" : "text-rose-300"}`}>{e.tag}</div>
                        <div className={`text-[11px] font-semibold ${e.impact === "High" ? "text-emerald-300" : e.impact === "Medium" ? "text-amber-300" : "text-slate-300"}`}>{e.impact}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>

          {/* BOTTOM */}
          <div className="grid grid-cols-12 gap-5">
            <GlassCard className="col-span-9 p-5">
              <div className="text-[13.5px] font-semibold text-white">What This Means for the Factory</div>
              <div className="grid grid-cols-6 gap-3 mt-3">
                {META.map((m) => (
                  <div key={m.label} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                    <div className="flex items-center gap-2">
                      <m.icon className="h-3.5 w-3.5 text-slate-400" />
                      <div className="text-[11px] text-slate-400">{m.label}</div>
                    </div>
                    <div className={`text-[11px] mt-2 ${m.c}`}>{m.sub}</div>
                    <div className="text-[18px] font-bold text-white tabular-nums leading-none mt-1">{m.v}</div>
                    <div className="mt-2"><Sparkline color={m.c.includes("emerald") ? "#22c55e" : "#38bdf8"} /></div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="col-span-3 p-5">
              <div className="text-[13.5px] font-semibold text-white">Bottom Line</div>
              <div className="flex items-start gap-3 mt-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-400/30 grid place-items-center shrink-0">
                  <ShieldCheck className="h-5 w-5 text-emerald-300" />
                </div>
                <div className="text-[12px] text-slate-200 leading-relaxed">This window delivers the lowest total impact with high confidence and minimal risk.</div>
              </div>
              <div className="mt-3 text-[11.5px] text-slate-400 flex items-center gap-2">
                <span>Confidence:</span>
                <span className="text-white font-semibold">89%</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300" style={{ width: "89%" }} />
                </div>
              </div>
              <button className="mt-4 inline-flex items-center gap-2 text-[12px] text-sky-300 hover:text-sky-200">
                <Download className="h-3.5 w-3.5" /> Download full explanation report →
              </button>
            </GlassCard>
          </div>
        </main>
      </div>
    </div>
  );
}
