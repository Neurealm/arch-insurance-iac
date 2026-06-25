import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Bell, Boxes, ChevronDown, Factory, HelpCircle, LayoutGrid, Network as NetIcon,
  Wrench, Sparkles, ShieldCheck, TrendingUp, TrendingDown, Activity, ArrowUp,
  ArrowDown, Minus as MinusIcon, CheckCircle2, Clock, AlertTriangle, Users,
  Droplets, Zap, DollarSign, Download, FileText, X, Cpu, Star, Award,
  FlaskConical, ClipboardCheck, Hammer, BadgeCheck, ArrowRight, Building2,
  HardHat, ListChecks,
  Gavel,
} from "lucide-react";
import {
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine,
} from "recharts";
import { AppShell } from "@/components/eoc/AppShell";

/* ============================= atoms ============================= */
function GlassCard({ children, className = "" }: any) {
  return (
    <div className={
      "rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl " +
      "shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_20px_50px_-30px_rgba(0,0,0,0.6)] " + className
    }>{children}</div>
  );
}

function useCountUp(target: number, duration = 1100) {
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

/* ============================= rail ============================= */
const RAIL = [
  { icon: LayoutGrid, label: "Command\nCenter", to: "/sead/command-center" },
  { icon: Boxes, label: "Digital Twin", to: "/sead/equipment-health-intelligence" },
  { icon: NetIcon, label: "Cross-Domain", to: "/sead/cross-domain-context-twin" },
  { icon: Wrench, label: "Decision\nSim", to: "/sead/maintenance-decision-simulator" },
  { icon: Factory, label: "Factory\nImpact", to: "/sead/factory-impact-simulator" },
  { icon: Sparkles, label: "Decision\nCenter", to: "/sead/ai-maintenance-decision-center", active: true },
  { icon: Gavel, label: "Human\nGovernance", to: "/sead/human-governance-center" },
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
            <motion.span layoutId="rail-aimdc-indicator"
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
          <div className="text-[16px] font-semibold text-white tracking-tight">AI Maintenance Decision Center</div>
          <div className="text-[11px] text-slate-400">AI-recommended maintenance window and decision rationale</div>
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
        <div className="leading-tight">
          <div className="text-[11.5px] text-slate-300">May 23, 2025 · 10:24 AM CT</div>
        </div>
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

/* ============================= sections ============================= */

function RecommendedWindowCard({ onOpen }: { onOpen: (id: string) => void }) {
  const confidence = useCountUp(94);
  return (
    <GlassCard className="col-span-12 xl:col-span-8 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center h-6 w-6 rounded-md bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
            <Star className="h-3.5 w-3.5" fill="currentColor" />
          </span>
          <div className="text-[13.5px] font-semibold text-white">Recommended Maintenance Window</div>
        </div>
        <span className="text-[10px] font-bold tracking-[0.18em] text-emerald-300 flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> AI RECOMMENDATION
        </span>
      </div>

      <div className="grid grid-cols-12 gap-4 items-start">
        <div className="col-span-12 md:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-[36px] leading-none font-bold bg-gradient-to-r from-emerald-300 to-emerald-400 bg-clip-text text-transparent"
          >
            Maintain Tonight
          </motion.div>
          <div className="text-[18px] text-white font-semibold mt-1.5">10:00 PM – 2:00 AM</div>
          <div className="text-[12px] text-slate-400">May 23, 2025</div>
          <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-400/30">
            <span className="text-[10.5px] text-emerald-300">Confidence:</span>
            <span className="text-[12px] font-bold text-emerald-200">{confidence.toFixed(0)}%</span>
            <svg width="40" height="14" viewBox="0 0 40 14" className="text-emerald-300">
              <path d="M2 12 A 12 12 0 0 1 38 12" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
              <path d={`M2 12 A 12 12 0 0 1 ${2 + (confidence / 100) * 36} ${12 - Math.sin((confidence / 100) * Math.PI) * 10}`} stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>
        <div className="col-span-12 md:col-span-7">
          <p className="text-[12.5px] text-slate-300 leading-relaxed">
            This is the optimal window to balance production commitments, yield protection, resource availability, and business impact.
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-white/[0.05] pt-3">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2 font-semibold">Decision Summary</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
          <SummaryKpi icon={Users} iconBg="bg-sky-500/15 text-sky-300" label="Production Impact" value="-320 wafers" onClick={() => onOpen("kpi-prod")} />
          <SummaryKpi icon={ShieldCheck} iconBg="bg-emerald-500/15 text-emerald-300" label="Yield Impact" value="-0.02%" onClick={() => onOpen("kpi-yield")} />
          <SummaryKpi icon={DollarSign} iconBg="bg-amber-500/15 text-amber-300" label="Revenue Impact" value="-$0.24M" onClick={() => onOpen("kpi-revenue")} />
          <SummaryKpi icon={Clock} iconBg="bg-indigo-500/15 text-indigo-300" label="Downtime" value="2h 30m" onClick={() => onOpen("kpi-downtime")} />
          <SummaryKpi icon={AlertTriangle} iconBg="bg-rose-500/15 text-rose-300" label="Risk of Failure if Delayed" value="High (18–22 days)" onClick={() => onOpen("kpi-risk")} />
        </div>
      </div>
    </GlassCard>
  );
}

function SummaryKpi({ icon: Icon, iconBg, label, value, onClick }: any) {
  return (
    <button onClick={onClick} className="text-left rounded-lg border border-white/[0.06] bg-white/[0.015] p-2.5 hover:bg-white/[0.04] transition">
      <div className="flex items-center gap-2 mb-1">
        <span className={`h-6 w-6 grid place-items-center rounded-md ${iconBg}`}><Icon className="h-3.5 w-3.5" /></span>
        <div className="text-[10.5px] text-slate-400 leading-tight">{label}</div>
      </div>
      <div className="text-[14px] font-bold text-white">{value}</div>
    </button>
  );
}

/* --- Why this window --- */
const REASONS = [
  { icon: Users, color: "text-fuchsia-300 bg-fuchsia-500/15", title: "Protects customer commitments", sub: "No at-risk orders in this window" },
  { icon: AlertTriangle, color: "text-sky-300 bg-sky-500/15", title: "Minimizes unplanned downtime risk", sub: "Equipment failure risk increases significantly after 18 days" },
  { icon: Droplets, color: "text-amber-300 bg-amber-500/15", title: "Aligns with utility window", sub: "Chilled water maintenance window available" },
  { icon: HardHat, color: "text-emerald-300 bg-emerald-500/15", title: "Optimizes resource availability", sub: "Technicians and critical parts available" },
  { icon: Award, color: "text-indigo-300 bg-indigo-500/15", title: "Minimizes overall business impact", sub: "Lowest combined impact across all evaluated options" },
];

function WhyThisWindow({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <GlassCard className="col-span-12 xl:col-span-4 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13.5px] font-semibold text-white">Why This Window?</div>
        <button onClick={() => onOpen("why-all")} className="text-[11px] text-sky-300 hover:text-sky-200 flex items-center gap-0.5">View Details <ArrowRight className="h-3 w-3" /></button>
      </div>
      <div className="space-y-2.5">
        {REASONS.map((r, i) => (
          <motion.button
            key={r.title}
            onClick={() => onOpen("reason-" + i)}
            initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}
            className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/[0.03] transition text-left"
          >
            <span className={`h-7 w-7 grid place-items-center rounded-md ring-1 ring-white/10 ${r.color}`}><r.icon className="h-3.5 w-3.5" /></span>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-white leading-tight">{r.title}</div>
              <div className="text-[10.5px] text-slate-400 leading-tight mt-0.5">{r.sub}</div>
            </div>
            <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
          </motion.button>
        ))}
      </div>
    </GlassCard>
  );
}

/* --- Option comparison --- */
type Opt = {
  id: string; rank: number; label: string; sub: string; recommended?: boolean;
  prod: number; yield_: string; rev: string; oee: number; risk: string; riskTone: string;
  tech: string; techTone: string; score: number; scoreColor: string;
};
const OPTIONS: Opt[] = [
  { id: "now", rank: 1, label: "Maintain Now", sub: "(Today)", prod: -1240, yield_: "-0.18%", rev: "-$1.24M", oee: -2.3, risk: "Low", riskTone: "text-emerald-300", tech: "High", techTone: "text-rose-300", score: 68, scoreColor: "bg-slate-400" },
  { id: "tonight", rank: 2, label: "Maintain Tonight", sub: "(10:00 PM – 2:00 AM)", recommended: true, prod: -320, yield_: "-0.02%", rev: "-$0.24M", oee: -0.6, risk: "Very High", riskTone: "text-rose-300", tech: "Medium", techTone: "text-amber-300", score: 94, scoreColor: "bg-emerald-400" },
  { id: "tomorrow", rank: 3, label: "Maintain Tomorrow", sub: "(May 24)", prod: -780, yield_: "-0.07%", rev: "-$0.81M", oee: -1.4, risk: "High", riskTone: "text-rose-300", tech: "High", techTone: "text-rose-300", score: 79, scoreColor: "bg-fuchsia-400" },
  { id: "next", rank: 4, label: "Maintain Next Week", sub: "(May 27–28)", prod: -120, yield_: "-0.31%", rev: "-$0.12M", oee: -0.2, risk: "High", riskTone: "text-rose-300", tech: "Low", techTone: "text-emerald-300", score: 61, scoreColor: "bg-amber-400" },
];

function OptionComparison({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <GlassCard className="col-span-12 xl:col-span-8 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13.5px] font-semibold text-white">Option Comparison <span className="text-slate-500 text-[11px] font-normal ml-1">(AI Evaluated 4 Options)</span></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="text-slate-500 text-[10.5px] uppercase tracking-wider">
              <th className="text-left font-medium pb-2">Option</th>
              <th className="text-right font-medium pb-2 pr-3">Production<br/><span className="normal-case text-[9.5px] text-slate-600">(wafers)</span></th>
              <th className="text-right font-medium pb-2 pr-3">Yield<br/><span className="normal-case text-[9.5px] text-slate-600">(%)</span></th>
              <th className="text-right font-medium pb-2 pr-3">Revenue</th>
              <th className="text-right font-medium pb-2 pr-3">OEE<br/><span className="normal-case text-[9.5px] text-slate-600">(pts)</span></th>
              <th className="text-right font-medium pb-2 pr-3">Risk if Delayed</th>
              <th className="text-right font-medium pb-2 pr-3">Technician Load</th>
              <th className="text-right font-medium pb-2">Overall Score<br/><span className="normal-case text-[9.5px] text-slate-600">(100)</span></th>
            </tr>
          </thead>
          <tbody>
            {OPTIONS.map((o) => (
              <tr
                key={o.id}
                onClick={() => onOpen("opt-" + o.id)}
                className={`cursor-pointer transition ${o.recommended ? "bg-emerald-500/[0.06] ring-1 ring-emerald-400/40 rounded-md" : "hover:bg-white/[0.03]"} `}
              >
                <td className="py-2.5 pl-1">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-6 w-6 rounded-full grid place-items-center text-[10.5px] font-bold text-white ${
                      o.rank === 1 ? "bg-sky-500" : o.rank === 2 ? "bg-emerald-500" : o.rank === 3 ? "bg-fuchsia-500" : "bg-amber-500"
                    }`}>{o.rank}</span>
                    <div>
                      <div className="text-white font-semibold flex items-center gap-2">
                        {o.label}
                        {o.recommended && <span className="text-[8.5px] font-bold tracking-wider bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded ring-1 ring-emerald-400/30">RECOMMENDED</span>}
                      </div>
                      <div className="text-[10px] text-slate-500">{o.sub}</div>
                    </div>
                  </div>
                </td>
                <td className="text-right pr-3 text-slate-200">{o.prod.toLocaleString()}</td>
                <td className="text-right pr-3 text-slate-200">{o.yield_}</td>
                <td className="text-right pr-3 text-rose-300 font-semibold">{o.rev}</td>
                <td className="text-right pr-3 text-slate-200">{o.oee}</td>
                <td className={`text-right pr-3 font-semibold ${o.riskTone}`}>
                  {o.risk}
                  {o.recommended && <div className="text-[9.5px] text-slate-500 font-normal">(after 18–22 days)</div>}
                </td>
                <td className={`text-right pr-3 font-semibold ${o.techTone}`}>{o.tech}</td>
                <td className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className={`h-full ${o.scoreColor}`} style={{ width: `${o.score}%` }} />
                    </div>
                    <span className="text-white font-bold w-6 text-right">{o.score}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-[10.5px] text-slate-500 mt-3 flex items-center justify-between border-t border-white/[0.05] pt-2">
        <span>Scoring considers production, yield, revenue, OEE, risk, resources and business priorities.</span>
        <button className="text-sky-300 hover:text-sky-200 flex items-center gap-0.5">View Scoring Methodology <ArrowRight className="h-3 w-3" /></button>
      </div>
    </GlassCard>
  );
}

/* --- Evidence --- */
const SIGNALS = [
  { label: "Chamber Pressure Stability", value: "2.1%", dir: "up", tone: "text-rose-300", note: "Worsening" },
  { label: "Vacuum Pump Vibration (X)", value: "2.8 mm/s", dir: "up", tone: "text-rose-300", note: "Worsening" },
  { label: "He Leak Rate", value: "3.2 sccm", dir: "up", tone: "text-rose-300", note: "Worsening" },
  { label: "RF Power Stability", value: "96.4%", dir: "flat", tone: "text-emerald-300", note: "Stable" },
  { label: "ESC Valve Cycles", value: "2.3K", dir: "up", tone: "text-rose-300", note: "Worsening" },
  { label: "MTBF Trend (30 Days)", value: "412 hrs", dir: "down", tone: "text-amber-300", note: "Decreasing" },
];

function EvidencePanel({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <GlassCard className="col-span-12 xl:col-span-4 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13.5px] font-semibold text-white">Key Evidence &amp; Signals</div>
        <button onClick={() => onOpen("evidence-all")} className="text-[11px] text-sky-300 hover:text-sky-200 flex items-center gap-0.5">View All <ArrowRight className="h-3 w-3" /></button>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {SIGNALS.map((s) => (
          <button key={s.label} onClick={() => onOpen("sig-" + s.label)} className="w-full flex items-center justify-between py-2 text-left hover:bg-white/[0.02] -mx-1 px-1 rounded">
            <span className="text-[12px] text-slate-300">{s.label}</span>
            <div className="flex items-center gap-2.5">
              <span className="text-[12px] font-bold text-white">{s.value}</span>
              <span className={`text-[11px] ${s.tone} flex items-center gap-0.5 w-[72px] justify-end`}>
                {s.dir === "up" ? <ArrowUp className="h-3 w-3" /> : s.dir === "down" ? <ArrowDown className="h-3 w-3" /> : <MinusIcon className="h-3 w-3" />}
                {s.note}
              </span>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-indigo-500/[0.08] ring-1 ring-indigo-400/25 p-2.5 flex gap-2">
        <Cpu className="h-4 w-4 text-indigo-300 mt-0.5 shrink-0" />
        <p className="text-[11px] text-slate-200 leading-snug">
          AI analysis indicates accelerated degradation in vacuum system.<br/>
          <span className="text-slate-400">Risk of unplanned failure increases significantly after 18–22 days.</span>
        </p>
      </div>
    </GlassCard>
  );
}

/* --- Rationales --- */
type Rationale = {
  id: string; icon: any; iconColor: string; title: string; bullets: string[]; impact: string; impactTone: string;
};
const RATIONALES: Rationale[] = [
  {
    id: "ops", icon: Factory, iconColor: "text-sky-300 bg-sky-500/15", title: "Operational Rationale",
    bullets: ["Maintains flow for 8 active lots", "No queue risk in CMP area", "Alternate tool ETCH-215 available (68% load)", "Back-end capacity sufficient"],
    impact: "Impact: Low", impactTone: "text-sky-300",
  },
  {
    id: "yield", icon: ShieldCheck, iconColor: "text-fuchsia-300 bg-fuchsia-500/15", title: "Yield & Quality Rationale",
    bullets: ["Delaying increases risk of chamber instability", "Higher particle rate after 18 days", "Yield loss avoided: ~0.16% if done tonight", "Recipe window remains valid"],
    impact: "Impact: Very Low", impactTone: "text-fuchsia-300",
  },
  {
    id: "res", icon: Users, iconColor: "text-emerald-300 bg-emerald-500/15", title: "Resource Rationale",
    bullets: ["Critical parts available (100%)", "2 senior technicians available tonight", "No competing high-priority work orders", "OEM engineer on site"],
    impact: "Impact: Low", impactTone: "text-emerald-300",
  },
  {
    id: "biz", icon: DollarSign, iconColor: "text-amber-300 bg-amber-500/15", title: "Business Rationale",
    bullets: ["Protects $1.8M revenue commitment", "Avoids expedited shipments", "Lowest total cost of ownership impact", "Aligns with monthly fab objectives"],
    impact: "Impact: Positive", impactTone: "text-emerald-300",
  },
];

function RationaleCard({ r, onOpen }: { r: Rationale; onOpen: (id: string) => void }) {
  return (
    <GlassCard className="p-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className={`h-7 w-7 grid place-items-center rounded-md ring-1 ring-white/10 ${r.iconColor}`}><r.icon className="h-3.5 w-3.5" /></span>
          <div className="text-[12.5px] font-semibold text-white">{r.title}</div>
        </div>
        <button onClick={() => onOpen("rat-" + r.id)} className="text-[10.5px] text-sky-300 hover:text-sky-200 flex items-center gap-0.5">View Details <ArrowRight className="h-3 w-3" /></button>
      </div>
      <ul className="space-y-1.5">
        {r.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-[11.5px] text-slate-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" /><span>{b}</span>
          </li>
        ))}
      </ul>
      <div className={`mt-3 text-[11.5px] font-bold ${r.impactTone}`}>{r.impact}</div>
    </GlassCard>
  );
}

/* --- Delay chart --- */
function DelayImpactChart() {
  const data = useMemo(() => Array.from({ length: 41 }, (_, i) => ({
    d: i,
    risk: Math.min(95, 8 + Math.pow(i / 10, 2.4) * 4 + (i > 18 ? (i - 18) * 2.4 : 0)),
  })), []);
  return (
    <GlassCard className="p-3.5 h-full">
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[12.5px] font-semibold text-white">What Happens If We Delay?</div>
        <button className="text-[10.5px] text-sky-300 hover:text-sky-200 flex items-center gap-0.5">View Analysis <ArrowRight className="h-3 w-3" /></button>
      </div>
      <div className="text-[10.5px] text-slate-400 mb-2">Failure Risk Over Time</div>
      <div className="h-[140px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="d" tick={{ fontSize: 9, fill: "#64748b" }} ticks={[0, 10, 20, 30, 40]} tickFormatter={(v) => `${v}`} axisLine={{ stroke: "#1e293b" }} tickLine={false} />
            <YAxis tick={{ fontSize: 9, fill: "#64748b" }} ticks={[0, 50, 100]} tickFormatter={(v) => v === 0 ? "Low" : v === 50 ? "Med" : "High"} axisLine={false} tickLine={false} width={36} />
            <Tooltip contentStyle={{ background: "#0b1220", border: "1px solid rgba(255,255,255,0.08)", fontSize: 11, borderRadius: 8 }} formatter={(v: any) => [`${(v as number).toFixed(0)}%`, "Risk"]} labelFormatter={(l) => `Day ${l}`} />
            <ReferenceLine x={18} stroke="#f43f5e" strokeDasharray="3 3" />
            <Area type="monotone" dataKey="risk" stroke="#f43f5e" strokeWidth={2} fill="url(#riskGrad)" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="absolute top-3 left-[45%] text-[9.5px] text-rose-300 bg-rose-500/10 ring-1 ring-rose-400/30 px-1.5 py-0.5 rounded">
          High risk after<br/>18–22 days
        </div>
        <div className="absolute bottom-2 right-2 text-[9px] text-slate-500">Days</div>
      </div>
    </GlassCard>
  );
}

/* --- Next steps / approvals --- */
const STEPS = [
  { n: 1, title: "Review & Approve", sub: "By required approvers" },
  { n: 2, title: "Schedule Maintenance", sub: "10:00 PM – 2:00 AM" },
  { n: 3, title: "Execute Work", sub: "Follow standard procedures" },
  { n: 4, title: "Validate & Close", sub: "Verify and document" },
];
const APPROVERS = [
  { name: "Manufacturing", icon: Factory, status: "Approved", tone: "text-emerald-400" },
  { name: "Engineering", icon: HardHat, status: "Pending", tone: "text-amber-300" },
  { name: "Facilities", icon: Building2, status: "Pending", tone: "text-amber-300" },
  { name: "Quality", icon: BadgeCheck, status: "Pending", tone: "text-amber-300" },
  { name: "Maintenance", icon: Hammer, status: "Pending", tone: "text-amber-300" },
  { name: "Operations", icon: ClipboardCheck, status: "Pending", tone: "text-amber-300" },
];

function FooterStrip() {
  return (
    <GlassCard className="p-4">
      <div className="grid grid-cols-12 gap-4 items-start">
        <div className="col-span-12 lg:col-span-5">
          <div className="text-[12.5px] font-semibold text-white mb-2.5">Next Steps</div>
          <div className="flex items-start gap-3 flex-wrap">
            {STEPS.map((s) => (
              <div key={s.n} className="flex items-start gap-2">
                <span className="h-6 w-6 grid place-items-center rounded-full bg-sky-500/15 ring-1 ring-sky-400/30 text-sky-300 text-[11px] font-bold">{s.n}</span>
                <div>
                  <div className="text-[11.5px] font-semibold text-white leading-tight">{s.title}</div>
                  <div className="text-[10px] text-slate-500 leading-tight">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <div className="text-[12.5px] font-semibold text-white mb-2.5">Required Approvals</div>
          <div className="flex items-start gap-3 flex-wrap">
            {APPROVERS.map((a) => (
              <div key={a.name} className="flex flex-col items-center gap-1 min-w-[64px]">
                <a.icon className="h-4 w-4 text-slate-400" />
                <div className="text-[10.5px] text-slate-300">{a.name}</div>
                <div className={`text-[10px] font-semibold ${a.tone} flex items-center gap-0.5`}>
                  {a.status === "Approved" && <CheckCircle2 className="h-3 w-3" />}
                  {a.status}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-2">
          <button className="h-10 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-[12.5px] font-semibold transition shadow-[0_0_24px_-8px_rgba(56,189,248,0.8)] flex items-center justify-center gap-2">
            <BadgeCheck className="h-4 w-4" /> Submit for Approval
          </button>
          <button className="h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-200 text-[12px] font-semibold hover:bg-white/[0.07] transition flex items-center justify-center gap-2">
            <Download className="h-3.5 w-3.5" /> Download Decision Brief
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

/* --- Intelligence drawer --- */
function IntelligenceDrawer({ open, id, onClose }: { open: boolean; id: string | null; onClose: () => void }) {
  const [tier, setTier] = useState<"100" | "200" | "300">("100");
  const title = id ? id.replace(/^(opt|kpi|sig|rat|reason|why|evidence)-/, "").replace(/-/g, " ") : "";
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
          <motion.aside
            initial={{ x: 460 }} animate={{ x: 0 }} exit={{ x: 460 }} transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="fixed right-0 top-0 bottom-0 w-[450px] bg-[#0b1220] border-l border-white/[0.06] z-50 flex flex-col"
          >
            <div className="px-4 h-14 flex items-center justify-between border-b border-white/[0.06]">
              <div>
                <div className="text-[9.5px] uppercase tracking-wider text-slate-500">Intelligence Drawer</div>
                <div className="text-[13px] font-semibold text-white capitalize">{title || "Recommendation Detail"}</div>
              </div>
              <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-md hover:bg-white/[0.05] text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
            </div>
            <div className="px-4 pt-3 flex gap-1.5">
              {(["100", "200", "300"] as const).map((t) => (
                <button key={t} onClick={() => setTier(t)} className={`text-[11px] px-2.5 py-1 rounded-md font-semibold transition ${
                  tier === t ? "bg-sky-500/15 text-sky-300 ring-1 ring-sky-400/30" : "text-slate-400 hover:bg-white/[0.04]"
                }`}>{t}-Level</button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-[12px] text-slate-300 leading-relaxed">
              {tier === "100" && (
                <>
                  <p>AI recommends maintaining ETCH-217 tonight (10:00 PM – 2:00 AM). This window protects $1.8M of customer revenue, avoids expedited shipments, and produces the lowest combined business impact across the four evaluated options.</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    <li>Recommendation confidence: 94%</li>
                    <li>Revenue protected: $1.8M</li>
                    <li>Downtime avoided: ~14 hours</li>
                    <li>Strategic alignment: monthly fab objectives</li>
                  </ul>
                </>
              )}
              {tier === "200" && (
                <>
                  <p>Operationally, 8 active lots continue flowing through alternate tool ETCH-215 (68% load). CMP queue depth stays under threshold; back-end capacity remains sufficient.</p>
                  <p className="text-slate-400">Two senior technicians and OEM engineer available tonight. All critical spare parts (chamber kit, ESC, RF match) confirmed on-site. Chilled water utility window is open.</p>
                </>
              )}
              {tier === "300" && (
                <>
                  <p>Bayesian RUL estimate: 18 days (CI 14–22) using vacuum vibration, He leak progression, and pressure stability features. Monte Carlo (5,000 trials) over Factory Twin shows P(unplanned failure &gt; cost of planned) crossing at day 18.</p>
                  <p className="text-slate-400">Discrete-event simulation: 320 wafer delta on the Maintain Tonight scenario across MES + AMHS routing using FactoryWorks lot priorities and SECS/GEM real-time tool states. Recipe drift remains within SPC golden-recipe window.</p>
                  <p className="text-slate-500 text-[11px]">Model: ETCH-RUL v3.2 · Inference: 2025-05-23 10:24 CT · Feature importance dominated by vacuum vibration X (28%) and RF stability (22%).</p>
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ============================= page ============================= */
export default function AIMaintenanceDecisionCenter() {
  const [drawer, setDrawer] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const open = (id: string) => setDrawer({ open: true, id });

  return (
    <AppShell>
      <div className="min-h-screen text-slate-200 bg-[#070b14]">
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.06),_transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(16,185,129,0.05),_transparent_55%)]" />
        </div>

        <AppHeader />

        <div className="flex">
          <ModuleRail />
          <main className="flex-1 min-w-0 px-5 py-4 space-y-3.5">

            <div className="grid grid-cols-12 gap-3.5">
              <RecommendedWindowCard onOpen={open} />
              <WhyThisWindow onOpen={open} />
            </div>

            <div className="grid grid-cols-12 gap-3.5">
              <OptionComparison onOpen={open} />
              <EvidencePanel onOpen={open} />
            </div>

            <div className="grid grid-cols-12 gap-3.5">
              <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {RATIONALES.map((r) => <RationaleCard key={r.id} r={r} onOpen={open} />)}
              </div>
              <div className="col-span-12 lg:col-span-4"><DelayImpactChart /></div>
            </div>

            <FooterStrip />

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-2 border-t border-white/[0.05]">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                AI Decision Twin streaming · MES · AMHS · FactoryWorks · APC · SECS/GEM · EDA
              </span>
              <span>Texas Instruments · DFW Fab · ETCH-217 · AI Model v3.2 · Confidence 94%</span>
            </div>
          </main>
        </div>

        <IntelligenceDrawer open={drawer.open} id={drawer.id} onClose={() => setDrawer({ open: false, id: null })} />
      </div>
    </AppShell>
  );
}
